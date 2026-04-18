import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { CustomerStatus } from '../../domain/customer.enums';

export class RegisterCustomerDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'password must contain upper, lower and numeric chars',
  })
  password!: string;
}

export class CustomerLoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class ChangeCustomerPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'newPassword must contain upper, lower and numeric chars',
  })
  newPassword!: string;
}

export class CustomerProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty({ enum: CustomerStatus })
  status!: CustomerStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CreateCustomerAddressDto {
  @ApiProperty()
  @IsString()
  @Length(8, 8)
  @Matches(/^\d{8}$/, { message: 'cep must have exactly 8 numeric digits' })
  cep!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  logradouro?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  numero!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  complemento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  bairro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  cidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  estado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  apelido?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateCustomerAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(8, 8)
  @Matches(/^\d{8}$/, { message: 'cep must have exactly 8 numeric digits' })
  cep?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  logradouro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  numero?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  complemento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  bairro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  cidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  estado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  apelido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CustomerAddressResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  cep!: string;

  @ApiProperty()
  logradouro!: string;

  @ApiProperty()
  numero!: string;

  @ApiPropertyOptional()
  complemento?: string;

  @ApiProperty()
  bairro!: string;

  @ApiProperty()
  cidade!: string;

  @ApiProperty()
  estado!: string;

  @ApiPropertyOptional()
  apelido?: string;

  @ApiProperty()
  isDefault!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
