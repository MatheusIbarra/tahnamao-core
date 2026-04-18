import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedRequestUser } from '../../../../identity/application/services/auth.service';
import { DriverStatus } from '../../../domain/driver.enums';

@Injectable()
export class DriverOperationalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedRequestUser }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('missing authenticated user');
    }
    if (user.driverStatus !== DriverStatus.APPROVED || !user.scopes.includes('drivers:operational')) {
      throw new ForbiddenException('driver is not approved for operational routes');
    }
    return true;
  }
}
