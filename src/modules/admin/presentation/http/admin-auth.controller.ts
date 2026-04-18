import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AdminAccessTokenDto,
  AdminLoginDto,
} from '../../../identity/application/dto/auth.dto';
import { AuthService } from '../../../identity/application/services/auth.service';

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
