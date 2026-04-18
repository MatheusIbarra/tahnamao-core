import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedRequestUser, AuthService } from '../../application/services/auth.service';
import { AuthTokensDto, LoginDto, LogoutDto, RefreshTokenDto } from '../../application/dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentAuthUser } from './decorators/current-auth-user.decorator';

interface HttpRequest {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}

@ApiTags('Identity')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Logs in a driver using CPF and password' })
  @ApiResponse({ status: 200, type: AuthTokensDto })
  async login(@Body() dto: LoginDto, @Req() request: HttpRequest): Promise<AuthTokensDto> {
    const tokens = await this.authService.login(dto, {
      ip: request.ip,
      userAgent: this.extractHeaderValue(request.headers['user-agent']),
    });
    return {
      ...tokens,
      tokenType: 'Bearer',
      expiresInSeconds: 15 * 60,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Renews an access token with a valid refresh token' })
  @ApiResponse({ status: 200, type: AuthTokensDto })
  async refresh(@Body() dto: RefreshTokenDto, @Req() request: HttpRequest): Promise<AuthTokensDto> {
    const tokens = await this.authService.refresh(dto, {
      ip: request.ip,
      userAgent: this.extractHeaderValue(request.headers['user-agent']),
    });
    return {
      ...tokens,
      tokenType: 'Bearer',
      expiresInSeconds: 15 * 60,
    };
  }

  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Revokes active refresh token(s)' })
  @ApiResponse({ status: 204, description: 'Token revoked.' })
  async logout(
    @CurrentAuthUser() user: AuthenticatedRequestUser,
    @Body() dto: LogoutDto,
    @Req() request: HttpRequest,
  ): Promise<void> {
    const bearer = this.extractHeaderValue(request.headers.authorization);
    const refreshToken =
      this.extractHeaderValue(request.headers['x-refresh-token']);
    if (!bearer) {
      return;
    }
    await this.authService.logout(user, refreshToken, dto.allSessions ?? false);
  }

  private extractHeaderValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }
}
