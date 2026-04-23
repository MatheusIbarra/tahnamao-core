import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const ADMIN_ORDERS_STATUS_FILTERS = ['PENDENTE', 'EM_ANDAMENTO', 'ENTREGUE', 'CANCELADO'] as const;

export type AdminOrdersStatusFilter = (typeof ADMIN_ORDERS_STATUS_FILTERS)[number];

export class AdminListOrdersQueryDto {
  @ApiPropertyOptional({ enum: ADMIN_ORDERS_STATUS_FILTERS })
  @IsOptional()
  @IsIn(ADMIN_ORDERS_STATUS_FILTERS)
  status?: AdminOrdersStatusFilter;

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Search by customer name/email' })
  @IsOptional()
  @IsString()
  customer?: string;

  @ApiPropertyOptional({ description: 'Search by driver full name' })
  @IsOptional()
  @IsString()
  driver?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 20;
}
