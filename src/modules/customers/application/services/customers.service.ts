import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  ChangeCustomerPasswordDto,
  CustomerProfileResponseDto,
  RegisterCustomerDto,
  UpdateCustomerProfileDto,
} from '../dto/customers.dto';
import {
  CustomerDocument,
  CustomerHydratedDocument,
} from '../../infrastructure/mongo/schemas/customer.schema';
import { CustomerStatus } from '../../domain/customer.enums';

interface ListAdminCustomersInput {
  name?: string;
  email?: string;
  page: number;
  limit: number;
}

interface AdminCustomerListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ATIVO' | 'BLOQUEADO';
  createdAt?: Date;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(CustomerDocument.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {}

  async register(dto: RegisterCustomerDto): Promise<CustomerProfileResponseDto> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedPhone = this.normalizePhone(dto.phone);

    await this.ensureUniqueEmailAndPhone(normalizedEmail, normalizedPhone);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const customer = await this.customerModel.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      phone: dto.phone.trim(),
      phoneNormalized: normalizedPhone,
      passwordHash,
      status: CustomerStatus.ACTIVE,
    });

    return this.toProfileResponse(customer);
  }

  async getProfile(customerId: string): Promise<CustomerProfileResponseDto> {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    return this.toProfileResponse(customer);
  }

  async updateProfile(customerId: string, dto: UpdateCustomerProfileDto): Promise<CustomerProfileResponseDto> {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    const nextPhone = dto.phone ? this.normalizePhone(dto.phone) : customer.phoneNormalized;
    await this.ensureUniquePhone(nextPhone, customer.id);

    customer.name = dto.name?.trim() ?? customer.name;
    customer.phone = dto.phone?.trim() ?? customer.phone;
    customer.phoneNormalized = nextPhone;
    await customer.save();

    return this.toProfileResponse(customer);
  }

  async changePassword(customerId: string, dto: ChangeCustomerPasswordDto): Promise<void> {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    const currentPasswordMatches = await bcrypt.compare(dto.currentPassword, customer.passwordHash);
    if (!currentPasswordMatches) {
      throw new UnauthorizedException('current password is invalid');
    }

    const samePassword = await bcrypt.compare(dto.newPassword, customer.passwordHash);
    if (samePassword) {
      throw new BadRequestException('new password must be different from current password');
    }

    customer.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await customer.save();
  }

  async listAdminCustomers(
    input: ListAdminCustomersInput,
  ): Promise<{ items: AdminCustomerListItem[]; total: number; page: number; limit: number }> {
    const query: FilterQuery<CustomerDocument> = {};
    const filters: FilterQuery<CustomerDocument>[] = [];

    if (input.name?.trim()) {
      filters.push({ name: { $regex: input.name.trim(), $options: 'i' } });
    }
    if (input.email?.trim()) {
      filters.push({ email: { $regex: input.email.trim(), $options: 'i' } });
    }
    if (filters.length > 0) {
      query.$and = filters;
    }

    const [items, total] = await Promise.all([
      this.customerModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit),
      this.customerModel.countDocuments(query),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        status: this.mapStatusToAdmin(item.status),
        createdAt: item.createdAt,
      })),
      total,
      page: input.page,
      limit: input.limit,
    };
  }

  async getAdminCustomerById(customerId: string): Promise<AdminCustomerListItem> {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: this.mapStatusToAdmin(customer.status),
      createdAt: customer.createdAt,
    };
  }

  async blockCustomer(customerId: string): Promise<void> {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    customer.status = CustomerStatus.BLOCKED;
    await customer.save();
  }

  async unblockCustomer(customerId: string): Promise<void> {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) {
      throw new NotFoundException('customer not found');
    }

    customer.status = CustomerStatus.ACTIVE;
    await customer.save();
  }

  private async ensureUniqueEmailAndPhone(
    email: string,
    phoneNormalized: string,
    currentCustomerId?: string,
  ): Promise<void> {
    const existingByEmail = await this.customerModel.findOne({ email });
    if (existingByEmail && existingByEmail._id.toString() !== currentCustomerId) {
      throw new ConflictException('email already in use');
    }

    const existingByPhone = await this.customerModel.findOne({ phoneNormalized });
    if (existingByPhone && existingByPhone._id.toString() !== currentCustomerId) {
      throw new ConflictException('phone already in use');
    }
  }

  private async ensureUniquePhone(phoneNormalized: string, currentCustomerId?: string): Promise<void> {
    const existingByPhone = await this.customerModel.findOne({ phoneNormalized });
    if (existingByPhone && existingByPhone._id.toString() !== currentCustomerId) {
      throw new ConflictException('phone already in use');
    }
  }

  private normalizePhone(phone: string): string {
    const normalized = phone.replace(/\D/g, '');
    if (!normalized) {
      throw new UnprocessableEntityException('phone must contain numeric digits');
    }
    return normalized;
  }

  private toProfileResponse(customer: CustomerHydratedDocument): CustomerProfileResponseDto {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  private mapStatusToAdmin(status: CustomerStatus): 'ATIVO' | 'BLOQUEADO' {
    return status === CustomerStatus.BLOCKED ? 'BLOQUEADO' : 'ATIVO';
  }
}
