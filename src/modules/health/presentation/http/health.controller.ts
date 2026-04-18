import { Controller, Get, HttpCode, ServiceUnavailableException } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CheckLivenessUseCase } from '../../application/use-cases/check-liveness.use-case';
import { CheckReadinessUseCase } from '../../application/use-cases/check-readiness.use-case';
import { HealthResponseDto } from '../../application/dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly checkLivenessUseCase: CheckLivenessUseCase,
    private readonly checkReadinessUseCase: CheckReadinessUseCase,
  ) {}

  @Get('live')
  @HttpCode(200)
  @ApiOperation({ summary: 'Liveness probe for process health' })
  @ApiResponse({ status: 200, type: HealthResponseDto })
  live(): HealthResponseDto {
    return this.checkLivenessUseCase.execute();
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe for dependencies (MongoDB)' })
  @ApiResponse({ status: 200, type: HealthResponseDto })
  @ApiResponse({ status: 503, type: HealthResponseDto })
  async ready(): Promise<HealthResponseDto> {
    try {
      const result: HealthCheckResult = await this.health.check([
        () => this.mongoose.pingCheck('mongo'),
      ]);

      return this.checkReadinessUseCase.execute({
        status: result.status === 'ok' ? 'ok' : 'error',
        checks: [
          {
            dependency: 'mongo',
            status: result.info?.mongo?.status ?? 'up',
            details: 'reachable',
          },
        ],
      });
    } catch {
      throw new ServiceUnavailableException(
        this.checkReadinessUseCase.execute({
          status: 'error',
          checks: [
            {
              dependency: 'mongo',
              status: 'down',
              details: 'unreachable',
            },
          ],
        }),
      );
    }
  }
}
