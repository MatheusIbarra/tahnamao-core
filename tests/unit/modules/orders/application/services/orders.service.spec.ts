import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { OrdersService } from '@src/modules/orders/application/services/orders.service';
import { OrderPaymentMethod, OrderStatus, RestaurantStatus } from '@src/modules/orders/domain/order.enums';

describe('OrdersService', () => {
  const makeModels = () => ({
    orderModel: { create: jest.fn(), exists: jest.fn() },
    restaurantModel: { findById: jest.fn() },
    menuItemModel: { find: jest.fn() },
    customerModel: { find: jest.fn(), findById: jest.fn() },
    driverModel: { find: jest.fn(), findById: jest.fn() },
  });

  const gateway = {
    emitNewOrderToRestaurant: jest.fn(),
  };

  const baseDto = {
    customerId: 'customer-1',
    customerPhoneSnapshot: '11999999999',
    restaurantId: 'restaurant-1',
    items: [
      {
        menuItemId: 'menu-1',
        quantity: 2,
      },
    ],
    deliveryAddress: {
      street: 'Rua A',
      number: '100',
      neighborhood: 'Centro',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01001000',
      lat: -23.55,
      lng: -46.63,
    },
    paymentMethod: OrderPaymentMethod.PIX,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates order with computed totals and emits websocket event', async () => {
    const { orderModel, restaurantModel, menuItemModel, customerModel, driverModel } = makeModels();
    restaurantModel.findById.mockResolvedValue({ id: 'restaurant-1', status: RestaurantStatus.OPEN });
    menuItemModel.find.mockResolvedValue([
      {
        id: 'menu-1',
        restaurantId: 'restaurant-1',
        price: 15,
        name: 'X-Burger',
        discountPercent: 0,
      },
    ]);
    orderModel.exists.mockResolvedValue(false);
    orderModel.create.mockResolvedValue({
      id: 'order-1',
      publicCode: 'TNM-ABC123',
      items: [
        {
          menuItemId: 'menu-1',
          quantity: 2,
          subtotal: 30,
        },
      ],
      deliveryAddress: baseDto.deliveryAddress,
      totalAmount: 30,
      status: OrderStatus.PENDING,
    });

    const service = new OrdersService(
      orderModel as any,
      restaurantModel as any,
      menuItemModel as any,
      customerModel as any,
      driverModel as any,
      gateway as any,
    );

    const result = await service.createOrder(baseDto.customerId, baseDto);

    expect(orderModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'customer-1',
        subtotal: 30,
        deliveryFee: 0,
        totalAmount: 30,
        status: OrderStatus.PENDING,
      }),
    );
    expect(gateway.emitNewOrderToRestaurant).toHaveBeenCalledWith(
      'restaurant-1',
      expect.objectContaining({
        orderId: 'order-1',
        totalAmount: 30,
      }),
    );
    expect(result).toEqual({ orderId: 'order-1', status: OrderStatus.PENDING, publicCode: 'TNM-ABC123' });
  });

  it('returns 422 when restaurant is closed', async () => {
    const { orderModel, restaurantModel, menuItemModel, customerModel, driverModel } = makeModels();
    restaurantModel.findById.mockResolvedValue({ id: 'restaurant-1', status: RestaurantStatus.CLOSED });
    const service = new OrdersService(
      orderModel as any,
      restaurantModel as any,
      menuItemModel as any,
      customerModel as any,
      driverModel as any,
      gateway as any,
    );

    await expect(service.createOrder(baseDto.customerId, baseDto)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('returns 422 when at least one item is unavailable', async () => {
    const { orderModel, restaurantModel, menuItemModel, customerModel, driverModel } = makeModels();
    restaurantModel.findById.mockResolvedValue({ id: 'restaurant-1', status: RestaurantStatus.OPEN });
    menuItemModel.find.mockResolvedValue([]);
    const service = new OrdersService(
      orderModel as any,
      restaurantModel as any,
      menuItemModel as any,
      customerModel as any,
      driverModel as any,
      gateway as any,
    );

    await expect(service.createOrder(baseDto.customerId, baseDto)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('returns 404 when restaurant does not exist', async () => {
    const { orderModel, restaurantModel, menuItemModel, customerModel, driverModel } = makeModels();
    restaurantModel.findById.mockResolvedValue(null);
    const service = new OrdersService(
      orderModel as any,
      restaurantModel as any,
      menuItemModel as any,
      customerModel as any,
      driverModel as any,
      gateway as any,
    );

    await expect(service.createOrder(baseDto.customerId, baseDto)).rejects.toBeInstanceOf(NotFoundException);
  });
});
