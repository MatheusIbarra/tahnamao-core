import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserType } from '../../../../identity/domain/auth.enums';

interface AdminRequestUser {
  userId: string;
  userType: AuthUserType;
}

export const AdminId = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{ user?: AdminRequestUser }>();
  return request.user?.userId ?? '';
});
