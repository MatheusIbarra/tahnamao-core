import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AuthenticatedCustomerUser,
  AuthService,
} from '../../../identity/application/services/auth.service';
import { AuthTokensDto, LogoutDto, RefreshTokenDto } from '../../../identity/application/dto/auth.dto';
import { AuthUserType } from '../../../identity/domain/auth.enums';
import { CurrentCustomer } from './decorators/current-customer.decorator';
import { CustomerAuthGuard } from './guards/customer-auth.guard';
import { CustomerLoginDto, CustomerPhoneLoginDto } from '../../application/dto/customers.dto';

interface HttpRequest {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}

@ApiTags('Customers')
@Controller('customers/auth')
export class CustomersAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logs in a customer using email and password' })
  @ApiResponse({ status: 200, type: AuthTokensDto })
  async login(@Body() dto: CustomerLoginDto, @Req() request: HttpRequest): Promise<AuthTokensDto> {
    const tokens = await this.authService.loginCustomer(dto.email, dto.password, {
      ip: request.ip,
      userAgent: this.extractHeaderValue(request.headers['user-agent']),
    });
    return {
      ...tokens,
      tokenType: 'Bearer',
      expiresInSeconds: 15 * 60,
    };
  }

  @Post('login-phone')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logs in a customer using phone and password' })
  @ApiResponse({ status: 200, type: AuthTokensDto })
  async loginByPhone(@Body() dto: CustomerPhoneLoginDto, @Req() request: HttpRequest): Promise<AuthTokensDto> {
    const tokens = await this.authService.loginCustomerByPhone(dto.phone, dto.password, {
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
  @ApiOperation({ summary: 'Renews customer access token with refresh token' })
  @ApiResponse({ status: 200, type: AuthTokensDto })
  async refresh(@Body() dto: RefreshTokenDto, @Req() request: HttpRequest): Promise<AuthTokensDto> {
    const tokens = await this.authService.refresh(
      dto,
      {
        ip: request.ip,
        userAgent: this.extractHeaderValue(request.headers['user-agent']),
      },
      { restrictUserType: AuthUserType.CUSTOMER },
    );
    return {
      ...tokens,
      tokenType: 'Bearer',
      expiresInSeconds: 15 * 60,
    };
  }

  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Revokes active customer refresh token(s)' })
  @ApiResponse({ status: 204, description: 'Token revoked.' })
  async logout(
    @CurrentCustomer() user: AuthenticatedCustomerUser,
    @Body() dto: LogoutDto,
    @Req() request: HttpRequest,
  ): Promise<void> {
    const refreshToken = this.extractHeaderValue(request.headers['x-refresh-token']);
    await this.authService.logout(user, refreshToken, dto.allSessions ?? false);
  }

  private extractHeaderValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }
}
