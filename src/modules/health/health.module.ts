import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './presentation/http/health.controller';
import { CheckLivenessUseCase } from './application/use-cases/check-liveness.use-case';
import { CheckReadinessUseCase } from './application/use-cases/check-readiness.use-case';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [CheckLivenessUseCase, CheckReadinessUseCase],
})
export class HealthModule {}
