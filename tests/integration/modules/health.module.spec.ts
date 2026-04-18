import { Test } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { HealthModule } from '@src/modules/health/health.module';

describe('HealthModule', () => {
  it('wires controller and providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TerminusModule, HealthModule],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
