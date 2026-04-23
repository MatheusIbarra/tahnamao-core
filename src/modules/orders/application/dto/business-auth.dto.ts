import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BusinessLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}

class BusinessAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cep!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty()
  @IsString()
  complement?: string;
}

class BusinessDeliveryDto {
  @ApiProperty()
  @IsNumber()
  @Min(5)
  estimatedDeliveryMinutes!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  baseFeeCents!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  minOrderValueCents!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  radiusKm!: number;
}

class BusinessOperatingHoursDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  openWeekdays!: number[];

  @ApiProperty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  openTime!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  closeTime!: string;
}

export class RegisterBusinessOwnerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  confirmPassword!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  establishmentName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiProperty({ type: BusinessAddressDto })
  @ValidateNested()
  @Type(() => BusinessAddressDto)
  address!: BusinessAddressDto;

  @ApiProperty({ type: BusinessDeliveryDto })
  @ValidateNested()
  @Type(() => BusinessDeliveryDto)
  delivery!: BusinessDeliveryDto;

  @ApiProperty({ type: BusinessOperatingHoursDto })
  @ValidateNested()
  @Type(() => BusinessOperatingHoursDto)
  operatingHours!: BusinessOperatingHoursDto;
}

export class BusinessAuthTokensDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  tokenType!: 'Bearer';

  @ApiProperty()
  expiresInSeconds!: number;

  @ApiProperty()
  userType!: 'BUSINESS';

  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  userId!: string;
}
