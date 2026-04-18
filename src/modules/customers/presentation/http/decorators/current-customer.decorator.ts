import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedCustomerUser } from '../../../../identity/application/services/auth.service';

export const CurrentCustomer = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedCustomerUser => {
    const request = context.switchToHttp().getRequest<{ user: AuthenticatedCustomerUser }>();
    return request.user;
  },
);
