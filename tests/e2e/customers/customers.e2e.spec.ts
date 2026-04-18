import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { CustomersModule } from '@src/modules/customers/customers.module';
import { ViaCepClient } from '@src/modules/customers/infrastructure/http/viacep.client';

describe('Customers (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.AUTH_ACCESS_TOKEN_SECRET = 'e2e-customer-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongoServer.getUri()),
        CustomersModule,
      ],
    })
      .overrideProvider(ViaCepClient)
      .useValue({
        lookup: jest.fn().mockResolvedValue({
          logradouro: 'Praca da Se',
          bairro: 'Se',
          cidade: 'Sao Paulo',
          estado: 'SP',
        }),
      })
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
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  it('runs customer register/auth/profile/addresses critical flow', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/customers/register')
      .send({
        name: 'Alice Customer',
        email: 'alice@example.com',
        phone: '11999999999',
        password: 'Password123',
      })
      .expect(201);

    expect(registerResponse.body.email).toBe('alice@example.com');
    expect(registerResponse.body.passwordHash).toBeUndefined();

    await request(app.getHttpServer())
      .post('/api/v1/customers/register')
      .send({
        name: 'Duplicate',
        email: 'alice@example.com',
        phone: '11988888888',
        password: 'Password123',
      })
      .expect(409);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/customers/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'Password123',
      })
      .expect(200);

    expect(loginResponse.body.accessToken).toBeDefined();
    expect(loginResponse.body.refreshToken).toBeDefined();
    const accessToken = loginResponse.body.accessToken as string;

    await request(app.getHttpServer())
      .get('/api/v1/customers/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const firstAddressResponse = await request(app.getHttpServer())
      .post('/api/v1/customers/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        cep: '01001000',
        numero: '100',
        apelido: 'Casa',
      })
      .expect(201);

    const secondAddressResponse = await request(app.getHttpServer())
      .post('/api/v1/customers/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        cep: '01001000',
        numero: '200',
        apelido: 'Trabalho',
        isDefault: true,
      })
      .expect(201);

    expect(secondAddressResponse.body.isDefault).toBe(true);

    const addressesResponse = await request(app.getHttpServer())
      .get('/api/v1/customers/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const defaultAddresses = addressesResponse.body.filter(
      (address: { isDefault: boolean }) => address.isDefault,
    );
    expect(defaultAddresses).toHaveLength(1);

    await request(app.getHttpServer())
      .patch(`/api/v1/customers/me/addresses/${firstAddressResponse.body.id}/default`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/customers/me/addresses/${secondAddressResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const addressesAfterDelete = await request(app.getHttpServer())
      .get('/api/v1/customers/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(addressesAfterDelete.body).toHaveLength(1);
  });
});
