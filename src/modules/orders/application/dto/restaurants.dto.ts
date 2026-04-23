import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class RestaurantAddressDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complement?: string;
}

export class RestaurantDeliveryDto {
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

export class RestaurantOperatingHoursDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  openWeekdays!: number[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  openTime!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  closeTime!: string;
}

export class UpdateRestaurantProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  document?: string;

  @ApiProperty()
  @IsEmail()
  contactEmail!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contactPhone!: string;

  @ApiProperty({ type: RestaurantAddressDto })
  @ValidateNested()
  @Type(() => RestaurantAddressDto)
  address!: RestaurantAddressDto;

  @ApiProperty({ type: RestaurantDeliveryDto })
  @ValidateNested()
  @Type(() => RestaurantDeliveryDto)
  delivery!: RestaurantDeliveryDto;

  @ApiProperty({ type: RestaurantOperatingHoursDto })
  @ValidateNested()
  @Type(() => RestaurantOperatingHoursDto)
  operatingHours!: RestaurantOperatingHoursDto;
}

export class UpdateRestaurantMediaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerUrl?: string;
}

export class RestaurantsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}
