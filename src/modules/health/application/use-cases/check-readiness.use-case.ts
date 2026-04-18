import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from '../dto/health-response.dto';

interface ReadinessCheckInput {
  checks: HealthResponseDto['checks'];
  status: HealthResponseDto['status'];
}

@Injectable()
export class CheckReadinessUseCase {
  execute(input: ReadinessCheckInput): HealthResponseDto {
    return {
      status: input.status,
      service: 'tahnamao-core',
      version: process.env.npm_package_version ?? '0.1.0',
      timestamp: new Date().toISOString(),
      checks: input.checks,
    };
  }
}
