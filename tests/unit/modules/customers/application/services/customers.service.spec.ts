import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CustomersService } from '@src/modules/customers/application/services/customers.service';

describe('CustomersService', () => {
  const makeModel = () => ({
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  });

  it('registers a customer and omits password hash in response', async () => {
    const model = makeModel();
    model.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    model.create.mockResolvedValue({
      id: 'customer-1',
      name: 'Alice',
      email: 'alice@example.com',
      phone: '11999999999',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T12:00:00.000Z'),
      updatedAt: new Date('2026-01-01T12:00:00.000Z'),
      passwordHash: 'hashed-secret',
    });
    const service = new CustomersService(model as any);

    const result = await service.register({
      name: 'Alice',
      email: 'Alice@Example.com',
      phone: '(11) 99999-9999',
      password: 'Password123',
    });

    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Alice',
        email: 'alice@example.com',
        phone: '(11) 99999-9999',
        phoneNormalized: '11999999999',
        status: 'ACTIVE',
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'customer-1',
        email: 'alice@example.com',
        phone: '11999999999',
      }),
    );
    expect(Object.prototype.hasOwnProperty.call(result, 'passwordHash')).toBe(false);
  });

  it('throws conflict when email already exists', async () => {
    const model = makeModel();
    model.findOne.mockResolvedValueOnce({ _id: { toString: () => 'existing-id' } });
    const service = new CustomersService(model as any);

    await expect(
      service.register({
        name: 'Alice',
        email: 'alice@example.com',
        phone: '11999999999',
        password: 'Password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates name and phone without changing email', async () => {
    const model = makeModel();
    const save = jest.fn();
    model.findById.mockResolvedValue({
      id: 'customer-1',
      name: 'Alice',
      email: 'alice@example.com',
      phone: '11999999999',
      phoneNormalized: '11999999999',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T12:00:00.000Z'),
      updatedAt: new Date('2026-01-01T12:00:00.000Z'),
      save,
    });
    model.findOne.mockResolvedValue(null);
    const service = new CustomersService(model as any);

    const result = await service.updateProfile('customer-1', {
      name: 'Alice Updated',
      phone: '(11) 98888-7777',
    });

    expect(save).toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        name: 'Alice Updated',
        phone: '(11) 98888-7777',
        email: 'alice@example.com',
      }),
    );
  });

  it('changes password when current password is valid', async () => {
    const model = makeModel();
    const save = jest.fn();
    const currentHash = await bcrypt.hash('OldPassword1', 4);
    model.findById.mockResolvedValue({
      id: 'customer-1',
      passwordHash: currentHash,
      save,
    });
    const service = new CustomersService(model as any);

    await service.changePassword('customer-1', {
      currentPassword: 'OldPassword1',
      newPassword: 'NewPassword1',
    });

    expect(save).toHaveBeenCalled();
  });

  it('rejects password change when current password is invalid', async () => {
    const model = makeModel();
    const save = jest.fn();
    const currentHash = await bcrypt.hash('OldPassword1', 4);
    model.findById.mockResolvedValue({
      id: 'customer-1',
      passwordHash: currentHash,
      save,
    });
    const service = new CustomersService(model as any);

    await expect(
      service.changePassword('customer-1', {
        currentPassword: 'WrongPassword1',
        newPassword: 'NewPassword1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
