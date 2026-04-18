import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from '@src/modules/health/presentation/http/health.controller';

describe('HealthController', () => {
  const makeController = () => {
    const health = {
      check: jest.fn(),
    };
    const mongoose = {
      pingCheck: jest.fn(),
    };
    const checkLivenessUseCase = {
      execute: jest.fn(),
    };
    const checkReadinessUseCase = {
      execute: jest.fn(),
    };

    const controller = new HealthController(
      health as any,
      mongoose as any,
      checkLivenessUseCase as any,
      checkReadinessUseCase as any,
    );

    return { controller, health, mongoose, checkLivenessUseCase, checkReadinessUseCase };
  };

  it('returns liveness payload', () => {
    const { controller, checkLivenessUseCase } = makeController();
    checkLivenessUseCase.execute.mockReturnValue({
      status: 'ok',
      service: 'tahnamao-core',
      version: '0.1.0',
      timestamp: '2026-04-18T10:00:00.000Z',
      checks: [{ dependency: 'process', status: 'up', details: 'running' }],
    });

    const result = controller.live();

    expect(checkLivenessUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: 'ok',
      service: 'tahnamao-core',
      version: '0.1.0',
      timestamp: '2026-04-18T10:00:00.000Z',
      checks: [{ dependency: 'process', status: 'up', details: 'running' }],
    });
  });

  it('returns readiness payload when mongo check succeeds', async () => {
    const { controller, health, mongoose, checkReadinessUseCase } = makeController();
    mongoose.pingCheck.mockResolvedValue({ mongo: { status: 'up' } });
    health.check.mockResolvedValue({
      status: 'ok',
      info: { mongo: { status: 'up' } },
    });
    checkReadinessUseCase.execute.mockReturnValue({
      status: 'ok',
      service: 'tahnamao-core',
      version: '0.1.0',
      timestamp: '2026-04-18T10:00:00.000Z',
      checks: [{ dependency: 'mongo', status: 'up', details: 'reachable' }],
    });

    const result = await controller.ready();

    expect(health.check).toHaveBeenCalledTimes(1);
    expect(checkReadinessUseCase.execute).toHaveBeenCalledWith({
      status: 'ok',
      checks: [{ dependency: 'mongo', status: 'up', details: 'reachable' }],
    });
    expect(result).toEqual({
      status: 'ok',
      service: 'tahnamao-core',
      version: '0.1.0',
      timestamp: '2026-04-18T10:00:00.000Z',
      checks: [{ dependency: 'mongo', status: 'up', details: 'reachable' }],
    });
  });

  it('throws ServiceUnavailableException when mongo check fails', async () => {
    const { controller, health, checkReadinessUseCase } = makeController();
    checkReadinessUseCase.execute.mockReturnValue({
      status: 'error',
      service: 'tahnamao-core',
      version: '0.1.0',
      timestamp: '2026-04-18T10:00:00.000Z',
      checks: [{ dependency: 'mongo', status: 'down', details: 'unreachable' }],
    });
    health.check.mockRejectedValue(new Error('mongo unavailable'));

    await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(checkReadinessUseCase.execute).toHaveBeenCalledWith({
      status: 'error',
      checks: [{ dependency: 'mongo', status: 'down', details: 'unreachable' }],
    });
  });
});
