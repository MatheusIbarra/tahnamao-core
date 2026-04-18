import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

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
