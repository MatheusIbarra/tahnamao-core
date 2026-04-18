import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DriverDocumentType } from '../../domain/driver.enums';

export class CreateDriverDraftDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateDriverProfileDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'cpf must be a valid formatted or normalized value',
  })
  cpf!: string;

  @ApiProperty()
  @IsDateString()
  birthDate!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class RegisterDriverDocumentDto {
  @ApiProperty({ enum: DriverDocumentType })
  @IsEnum(DriverDocumentType)
  type!: DriverDocumentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  originalFileName!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d+$/, { message: 'fileSizeBytes must be a numeric string' })
  fileSizeBytes!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(11, 11)
  extractedCpfNormalized?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  extractedFullName?: string;
}

export class SubmitDriverOnboardingDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  declarationAccepted?: boolean;
}

export class DriverStatusResponseDto {
  @ApiProperty()
  driverId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  onboardingStep!: string;

  @ApiPropertyOptional()
  rejectionReason?: string;
}
