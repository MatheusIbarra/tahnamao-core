import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { HealthModule } from '@src/modules/health/health.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health/live (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/health/live').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('tahnamao-core');
  });
});
