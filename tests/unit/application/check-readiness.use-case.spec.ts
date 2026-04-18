import { CheckReadinessUseCase } from '@src/modules/health/application/use-cases/check-readiness.use-case';

describe('CheckReadinessUseCase', () => {
  it('returns standardized readiness payload', () => {
    const useCase = new CheckReadinessUseCase();
    const result = useCase.execute({
      status: 'ok',
      checks: [{ dependency: 'mongo', status: 'up', details: 'reachable' }],
    });

    expect(result.service).toBe('tahnamao-core');
    expect(result.status).toBe('ok');
    expect(result.checks[0]?.dependency).toBe('mongo');
  });
});
