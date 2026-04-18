import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class SetDriverPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'password must contain upper, lower and numeric chars',
  })
  password!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  passwordConfirm!: string;
}

export class LoginDto {
  @ApiProperty()
  @IsString()
  @Matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'cpf must be a valid formatted or normalized value',
  })
  cpf!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class LogoutDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allSessions?: boolean;
}

export class AuthTokensDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  tokenType!: 'Bearer';

  @ApiProperty()
  expiresInSeconds!: number;
}

export class AdminLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'email must be a valid value',
  })
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class AdminAccessTokenDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  tokenType!: 'Bearer';

  @ApiProperty()
  expiresInSeconds!: number;
}
