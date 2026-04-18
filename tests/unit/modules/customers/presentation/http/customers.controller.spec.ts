import { CustomersController } from '@src/modules/customers/presentation/http/customers.controller';

describe('CustomersController', () => {
  const makeController = () => {
    const customersService = {
      register: jest.fn(),
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
    };
    const customerAddressesService = {
      create: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      setDefault: jest.fn(),
    };
    const controller = new CustomersController(customersService as any, customerAddressesService as any);
    return { controller, customersService, customerAddressesService };
  };

  it('delegates customer registration', async () => {
    const { controller, customersService } = makeController();
    customersService.register.mockResolvedValue({ id: 'customer-1' });

    const result = await controller.register({
      name: 'Alice',
      email: 'alice@example.com',
      phone: '11999999999',
      password: 'Password123',
    });

    expect(customersService.register).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      phone: '11999999999',
      password: 'Password123',
    });
    expect(result).toEqual({ id: 'customer-1' });
  });

  it('delegates address update to service', async () => {
    const { controller, customerAddressesService } = makeController();
    customerAddressesService.update.mockResolvedValue({ id: 'address-1' });

    const result = await controller.updateAddress(
      { userId: 'customer-1' },
      'address-1',
      { apelido: 'Casa' },
    );

    expect(customerAddressesService.update).toHaveBeenCalledWith('customer-1', 'address-1', {
      apelido: 'Casa',
    });
    expect(result).toEqual({ id: 'address-1' });
  });

  it('delegates customer password change to service', async () => {
    const { controller, customersService } = makeController();

    await controller.changeMyPassword(
      { userId: 'customer-1' },
      { currentPassword: 'OldPassword1', newPassword: 'NewPassword1' },
    );

    expect(customersService.changePassword).toHaveBeenCalledWith('customer-1', {
      currentPassword: 'OldPassword1',
      newPassword: 'NewPassword1',
    });
  });
});
