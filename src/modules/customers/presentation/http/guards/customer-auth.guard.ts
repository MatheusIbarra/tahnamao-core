import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../../../identity/application/services/auth.service';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: unknown;
    }>();
    const raw = request.headers.authorization;
    if (!raw?.startsWith('Bearer ')) {
      throw new UnauthorizedException('missing bearer token');
    }
    const token = raw.substring('Bearer '.length);
    request.user = await this.authService.validateCustomerAccessToken(token);
    return true;
  }
}
