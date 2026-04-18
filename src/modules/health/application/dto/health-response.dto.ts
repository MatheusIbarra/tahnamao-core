import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckItemDto {
  @ApiProperty({ example: 'mongo' })
  dependency!: string;

  @ApiProperty({ example: 'up' })
  status!: 'up' | 'down';

  @ApiProperty({ example: 'reachable' })
  details!: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok' | 'error';

  @ApiProperty({ example: 'tahnamao-core' })
  service!: string;

  @ApiProperty({ example: '0.1.0' })
  version!: string;

  @ApiProperty({ example: '2026-04-18T13:20:00.000Z' })
  timestamp!: string;

  @ApiProperty({
    type: [HealthCheckItemDto],
    example: [{ dependency: 'mongo', status: 'up', details: 'reachable' }],
  })
  checks!: HealthCheckItemDto[];
}
