import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AdminAccessTokenDto,
  AdminLoginDto,
  RefreshTokenDto,
} from '../../../identity/application/dto/auth.dto';
import { AuthService } from '../../../identity/application/services/auth.service';
import { AuthUserType } from '../../../identity/domain/auth.enums';

interface HttpRequest {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logs in an administrator using dedicated admin credentials' })
  @ApiResponse({ status: 200, type: AdminAccessTokenDto })
  async login(@Body() dto: AdminLoginDto, @Req() request: HttpRequest): Promise<AdminAccessTokenDto> {
    const result = await this.authService.loginAdmin(dto, {
      ip: request.ip,
      userAgent: this.extractHeaderValue(request.headers['user-agent']),
    });

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenType: 'Bearer',
      expiresInSeconds: 15 * 60,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renews an admin access token using a valid admin refresh token' })
  @ApiResponse({ status: 200, type: AdminAccessTokenDto })
  async refresh(@Body() dto: RefreshTokenDto, @Req() request: HttpRequest): Promise<AdminAccessTokenDto> {
    const tokens = await this.authService.refresh(
      dto,
      {
        ip: request.ip,
        userAgent: this.extractHeaderValue(request.headers['user-agent']),
      },
      { restrictUserType: AuthUserType.ADMIN },
    );
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresInSeconds: 15 * 60,
    };
  }

  private extractHeaderValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }
}
