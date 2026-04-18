import { AdminCustomersController } from '@src/modules/admin/presentation/http/admin-customers.controller';

describe('AdminCustomersController', () => {
  const makeController = () => {
    const customersService = {
      listAdminCustomers: jest.fn(),
      getAdminCustomerById: jest.fn(),
      blockCustomer: jest.fn(),
      unblockCustomer: jest.fn(),
    };

    const controller = new AdminCustomersController(
      customersService as unknown as ConstructorParameters<typeof AdminCustomersController>[0],
    );

    return { controller, customersService };
  };

  it('lists customers using provided filters and pagination', async () => {
    const { controller, customersService } = makeController();
    customersService.listAdminCustomers.mockResolvedValue({
      items: [{ id: 'customer-1' }],
      total: 1,
      page: 2,
      limit: 10,
    });

    const result = await controller.listCustomers({
      name: 'Maria',
      email: 'maria@email.com',
      page: 2,
      limit: 10,
    });

    expect(customersService.listAdminCustomers).toHaveBeenCalledWith({
      name: 'Maria',
      email: 'maria@email.com',
      page: 2,
      limit: 10,
    });
    expect(result).toEqual({
      items: [{ id: 'customer-1' }],
      total: 1,
      page: 2,
      limit: 10,
    });
  });

  it('returns customer details', async () => {
    const { controller, customersService } = makeController();
    customersService.getAdminCustomerById.mockResolvedValue({
      id: 'customer-2',
      name: 'Joana',
    });

    const result = await controller.getCustomer('customer-2');

    expect(customersService.getAdminCustomerById).toHaveBeenCalledWith('customer-2');
    expect(result).toEqual({
      id: 'customer-2',
      name: 'Joana',
    });
  });

  it('blocks customer and returns ok status', async () => {
    const { controller, customersService } = makeController();

    const result = await controller.blockCustomer('customer-3');

    expect(customersService.blockCustomer).toHaveBeenCalledWith('customer-3');
    expect(result).toEqual({ status: 'ok' });
  });

  it('unblocks customer and returns ok status', async () => {
    const { controller, customersService } = makeController();

    const result = await controller.unblockCustomer('customer-4');

    expect(customersService.unblockCustomer).toHaveBeenCalledWith('customer-4');
    expect(result).toEqual({ status: 'ok' });
  });
});
