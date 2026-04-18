import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../../../identity/application/services/auth.service';

interface AdminHttpRequest {
  originalUrl?: string;
  url?: string;
  headers: Record<string, string | undefined>;
  user?: unknown;
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }

    const request = context.switchToHttp().getRequest<AdminHttpRequest>();
    const path = request.originalUrl ?? request.url ?? '';
    if (!path.includes('/api/v1/admin/')) {
      return true;
    }

    const raw = request.headers.authorization;
    if (!raw?.startsWith('Bearer ')) {
      throw new UnauthorizedException('missing bearer token');
    }
    const token = raw.substring('Bearer '.length);
    try {
      request.user = await this.authService.validateAdminAccessToken(token);
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new ForbiddenException('admin role is required to access admin routes');
    }
  }
}
