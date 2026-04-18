import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateCustomerAddressDto,
  CustomerAddressResponseDto,
  UpdateCustomerAddressDto,
} from '../dto/customers.dto';
import {
  CustomerAddressDocument,
  CustomerAddressHydratedDocument,
} from '../../infrastructure/mongo/schemas/customer-address.schema';
import { ViaCepClient } from '../../infrastructure/http/viacep.client';

interface ResolvedAddressFields {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

@Injectable()
export class CustomerAddressesService {
  constructor(
    @InjectModel(CustomerAddressDocument.name)
    private readonly customerAddressModel: Model<CustomerAddressDocument>,
    private readonly viaCepClient: ViaCepClient,
  ) {}

  async create(customerId: string, dto: CreateCustomerAddressDto): Promise<CustomerAddressResponseDto> {
    this.assertCep(dto.cep);
    const resolvedFields = await this.resolveAddressFields(dto.cep, dto);
    const shouldBeDefault = await this.resolveShouldBeDefault(customerId, dto.isDefault);

    if (shouldBeDefault) {
      await this.clearDefault(customerId);
    }

    const address = await this.customerAddressModel.create({
      customerId,
      cep: dto.cep,
      numero: dto.numero.trim(),
      complemento: dto.complemento?.trim(),
      apelido: dto.apelido?.trim(),
      ...resolvedFields,
      isDefault: shouldBeDefault,
      isActive: true,
    });

    return this.toAddressResponse(address);
  }

  async list(customerId: string): Promise<CustomerAddressResponseDto[]> {
    const addresses = await this.customerAddressModel
      .find({ customerId, isActive: true })
      .sort({ isDefault: -1, createdAt: -1 });

    return addresses.map((item) => this.toAddressResponse(item));
  }

  async getById(customerId: string, addressId: string): Promise<CustomerAddressResponseDto> {
    const address = await this.findActiveAddress(customerId, addressId);
    return this.toAddressResponse(address);
  }

  async update(
    customerId: string,
    addressId: string,
    dto: UpdateCustomerAddressDto,
  ): Promise<CustomerAddressResponseDto> {
    const address = await this.findActiveAddress(customerId, addressId);
    const nextCep = dto.cep ?? address.cep;
    this.assertCep(nextCep);

    const resolvedFields = await this.resolveAddressFields(nextCep, {
      logradouro: dto.logradouro ?? address.logradouro,
      bairro: dto.bairro ?? address.bairro,
      cidade: dto.cidade ?? address.cidade,
      estado: dto.estado ?? address.estado,
    });

    const shouldBeDefault = dto.isDefault ?? address.isDefault;
    if (shouldBeDefault) {
      await this.clearDefault(customerId, address.id);
    }

    address.cep = nextCep;
    address.logradouro = resolvedFields.logradouro;
    address.bairro = resolvedFields.bairro;
    address.cidade = resolvedFields.cidade;
    address.estado = resolvedFields.estado;
    address.numero = dto.numero?.trim() ?? address.numero;
    address.complemento = dto.complemento?.trim();
    address.apelido = dto.apelido?.trim();
    address.isDefault = shouldBeDefault;
    await address.save();

    return this.toAddressResponse(address);
  }

  async remove(customerId: string, addressId: string): Promise<void> {
    const address = await this.findActiveAddress(customerId, addressId);
    address.isActive = false;
    address.isDefault = false;
    await address.save();
  }

  async setDefault(customerId: string, addressId: string): Promise<CustomerAddressResponseDto> {
    const address = await this.findActiveAddress(customerId, addressId);
    await this.clearDefault(customerId, address.id);
    address.isDefault = true;
    await address.save();
    return this.toAddressResponse(address);
  }

  private assertCep(cep: string): void {
    if (!/^\d{8}$/.test(cep)) {
      throw new BadRequestException('cep must have exactly 8 numeric digits');
    }
  }

  private async resolveAddressFields(
    cep: string,
    payload: {
      logradouro?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
    },
  ): Promise<ResolvedAddressFields> {
    const suggestion = await this.viaCepClient.lookup(cep);

    const logradouro = payload.logradouro?.trim() || suggestion?.logradouro?.trim();
    const bairro = payload.bairro?.trim() || suggestion?.bairro?.trim();
    const cidade = payload.cidade?.trim() || suggestion?.cidade?.trim();
    const estado = (payload.estado?.trim() || suggestion?.estado?.trim() || '').toUpperCase();

    if (!logradouro || !bairro || !cidade || !/^[A-Z]{2}$/.test(estado)) {
      throw new UnprocessableEntityException(
        'logradouro, bairro, cidade and estado must be provided when CEP lookup has missing values',
      );
    }

    return { logradouro, bairro, cidade, estado };
  }

  private async resolveShouldBeDefault(customerId: string, incoming?: boolean): Promise<boolean> {
    if (incoming !== undefined) {
      return incoming;
    }
    const activeAddressesCount = await this.customerAddressModel.countDocuments({
      customerId,
      isActive: true,
    });
    return activeAddressesCount === 0;
  }

  private async clearDefault(customerId: string, excludeAddressId?: string): Promise<void> {
    const query: Record<string, unknown> = {
      customerId,
      isActive: true,
      isDefault: true,
    };

    if (excludeAddressId) {
      query._id = { $ne: excludeAddressId };
    }

    await this.customerAddressModel.updateMany(query, { $set: { isDefault: false } });
  }

  private async findActiveAddress(
    customerId: string,
    addressId: string,
  ): Promise<CustomerAddressHydratedDocument> {
    const address = await this.customerAddressModel.findOne({
      _id: addressId,
      customerId,
      isActive: true,
    });

    if (!address) {
      throw new NotFoundException('address not found');
    }

    return address;
  }

  private toAddressResponse(address: CustomerAddressHydratedDocument): CustomerAddressResponseDto {
    return {
      id: address.id,
      cep: address.cep,
      logradouro: address.logradouro,
      numero: address.numero,
      complemento: address.complemento,
      bairro: address.bairro,
      cidade: address.cidade,
      estado: address.estado,
      apelido: address.apelido,
      isDefault: address.isDefault,
      isActive: address.isActive,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}
