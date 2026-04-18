import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AdminId = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
  return request.headers['x-admin-id'] ?? '';
});
