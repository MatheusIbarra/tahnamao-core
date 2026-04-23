import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MenuItemDocument } from '@src/modules/orders/infrastructure/mongo/schemas/menu-item.schema';
import { OrderDocument } from '@src/modules/orders/infrastructure/mongo/schemas/order.schema';
import { RestaurantDocument } from '@src/modules/orders/infrastructure/mongo/schemas/restaurant.schema';
import { OrdersModule } from '@src/modules/orders/orders.module';
import { OrderPaymentMethod, RestaurantStatus } from '@src/modules/orders/domain/order.enums';
import { OrdersGateway } from '@src/modules/orders/presentation/websocket/orders.gateway';
import { Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let restaurantModel: Model<RestaurantDocument>;
  let menuItemModel: Model<MenuItemDocument>;
  let orderModel: Model<OrderDocument>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.AUTH_ACCESS_TOKEN_SECRET = 'e2e-order-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongoServer.getUri()),
        OrdersModule,
      ],
    })
      .overrideProvider(OrdersGateway)
      .useValue({ emitNewOrderToRestaurant: jest.fn() })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    restaurantModel = app.get(getModelToken(RestaurantDocument.name));
    menuItemModel = app.get(getModelToken(MenuItemDocument.name));
    orderModel = app.get(getModelToken(OrderDocument.name));
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      restaurantModel.deleteMany({}),
      menuItemModel.deleteMany({}),
      orderModel.deleteMany({}),
    ]);
  });

  it('creates a pending order and persists totals', async () => {
    const restaurant = await restaurantModel.create({
      name: 'Pizzaria Central',
      status: RestaurantStatus.OPEN,
    });
    const menuItem = await menuItemModel.create({
      restaurantId: restaurant.id,
      name: 'Pizza Margherita',
      description: 'Molho de tomate e manjericao',
      imageUrl: 'https://cdn.example.com/pizza.jpg',
      price: 42,
      discountPercent: 0,
      available: true,
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send({
        customerId: 'customer-e2e-1',
        customerPhoneSnapshot: '11999998888',
        restaurantId: restaurant.id,
        items: [
          {
            menuItemId: menuItem.id,
            quantity: 2,
            observation: 'Sem cebola',
          },
        ],
        deliveryAddress: {
          street: 'Rua das Flores',
          number: '10',
          complement: 'Apto 12',
          neighborhood: 'Centro',
          city: 'Sao Paulo',
          state: 'SP',
          zipCode: '01001000',
          lat: -23.55,
          lng: -46.63,
        },
        paymentMethod: OrderPaymentMethod.PIX,
      })
      .expect(201);

    expect(response.body.status).toBe('PENDING');
    expect(response.body.orderId).toBeDefined();

    const storedOrder = await orderModel.findById(response.body.orderId);
    expect(storedOrder).not.toBeNull();
    expect(storedOrder?.subtotal).toBe(84);
    expect(storedOrder?.totalAmount).toBe(84);
    expect(storedOrder?.status).toBe('PENDING');
  });

  it('returns 422 when restaurant is closed', async () => {
    const restaurant = await restaurantModel.create({
      name: 'Lanches da Esquina',
      status: RestaurantStatus.CLOSED,
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send({
        customerId: 'customer-e2e-1',
        customerPhoneSnapshot: '11999998888',
        restaurantId: restaurant.id,
        items: [{ menuItemId: 'menu-id', quantity: 1 }],
        deliveryAddress: {
          street: 'Rua B',
          number: '22',
          neighborhood: 'Centro',
          city: 'Sao Paulo',
          state: 'SP',
          zipCode: '01001000',
          lat: -23.55,
          lng: -46.63,
        },
        paymentMethod: OrderPaymentMethod.CASH,
      })
      .expect(422);

    expect(response.body.message).toContain('restaurante fechado');
  });

  it('returns 422 when requested item is unavailable', async () => {
    const restaurant = await restaurantModel.create({
      name: 'Burger House',
      status: RestaurantStatus.OPEN,
    });
    const unavailableItem = await menuItemModel.create({
      restaurantId: restaurant.id,
      name: 'Burger Bacon',
      description: 'Pao e carne',
      imageUrl: 'https://cdn.example.com/burger.jpg',
      price: 30,
      discountPercent: 0,
      available: false,
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send({
        customerId: 'customer-e2e-1',
        customerPhoneSnapshot: '11999998888',
        restaurantId: restaurant.id,
        items: [{ menuItemId: unavailableItem.id, quantity: 1 }],
        deliveryAddress: {
          street: 'Rua C',
          number: '200',
          neighborhood: 'Jardins',
          city: 'Sao Paulo',
          state: 'SP',
          zipCode: '01310930',
          lat: -23.56,
          lng: -46.66,
        },
        paymentMethod: OrderPaymentMethod.CREDIT_CARD,
      })
      .expect(422);

    expect(response.body.message).toContain('item indisponivel');
  });
});
