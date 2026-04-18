import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { CustomerAddressesService } from '@src/modules/customers/application/services/customer-addresses.service';

describe('CustomerAddressesService', () => {
  const makeModel = () => ({
    countDocuments: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  });

  const makeAddressDocument = () => ({
    id: 'address-1',
    cep: '01001000',
    logradouro: 'Praca da Se',
    numero: '100',
    complemento: 'Apto 10',
    bairro: 'Se',
    cidade: 'Sao Paulo',
    estado: 'SP',
    apelido: 'Casa',
    isDefault: true,
    isActive: true,
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    save: jest.fn(),
  });

  it('rejects invalid CEP format', async () => {
    const model = makeModel();
    const viaCepClient = { lookup: jest.fn() };
    const service = new CustomerAddressesService(model as any, viaCepClient as any);

    await expect(
      service.create('customer-1', {
        cep: '123',
        numero: '10',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('clears previous default when creating a new default address', async () => {
    const model = makeModel();
    const address = makeAddressDocument();
    model.create.mockResolvedValue(address);
    model.updateMany.mockResolvedValue({ modifiedCount: 1 });
    model.countDocuments.mockResolvedValue(2);
    const viaCepClient = {
      lookup: jest.fn().mockResolvedValue({
        logradouro: 'Praca da Se',
        bairro: 'Se',
        cidade: 'Sao Paulo',
        estado: 'SP',
      }),
    };
    const service = new CustomerAddressesService(model as any, viaCepClient as any);

    const result = await service.create('customer-1', {
      cep: '01001000',
      numero: '100',
      isDefault: true,
    });

    expect(model.updateMany).toHaveBeenCalledWith(
      { customerId: 'customer-1', isActive: true, isDefault: true },
      { $set: { isDefault: false } },
    );
    expect(result.isDefault).toBe(true);
  });

  it('requires manual fields when ViaCEP is unavailable', async () => {
    const model = makeModel();
    model.countDocuments.mockResolvedValue(0);
    const viaCepClient = { lookup: jest.fn().mockResolvedValue(null) };
    const service = new CustomerAddressesService(model as any, viaCepClient as any);

    await expect(
      service.create('customer-1', {
        cep: '01001000',
        numero: '100',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
});
