import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from '../dto/health-response.dto';

@Injectable()
export class CheckLivenessUseCase {
  execute(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'tahnamao-core',
      version: process.env.npm_package_version ?? '0.1.0',
      timestamp: new Date().toISOString(),
      checks: [{ dependency: 'process', status: 'up', details: 'running' }],
    };
  }
}
