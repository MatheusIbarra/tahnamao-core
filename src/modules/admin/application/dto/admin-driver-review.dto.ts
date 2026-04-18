import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class AdminListPendingDriversQueryDto {
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
  pageSize = 20;
}

const ADMIN_DRIVERS_LIST_STATUSES = [
  'PENDENTE_APROVACAO',
  'DISPONIVEL',
  'EM_CORRIDA',
  'BLOQUEADO',
] as const;

export type AdminDriversListStatus = (typeof ADMIN_DRIVERS_LIST_STATUSES)[number];

export class AdminListDriversQueryDto {
  @ApiPropertyOptional({
    enum: ADMIN_DRIVERS_LIST_STATUSES,
  })
  @IsOptional()
  @IsIn(ADMIN_DRIVERS_LIST_STATUSES)
  status?: AdminDriversListStatus;

  @ApiPropertyOptional({ description: 'Search by name or CPF' })
  @IsOptional()
  @IsString()
  search?: string;

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

export class AdminDecisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  checkedCpfMatch?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  checkedFaceMatch?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  checkedDocumentReadability?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  checkedFraudSignals?: boolean;
}

export class AdminDocumentDecisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  reason?: string;
}
