import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from '@src/modules/admin/presentation/http/guards/admin.guard';

describe('AdminGuard', () => {
  const makeExecutionContext = (request: Record<string, unknown>) =>
    ({
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as any;

  it('allows non-admin routes', async () => {
    const authService = { validateAdminAccessToken: jest.fn() };
    const guard = new AdminGuard(authService as any);
    const context = makeExecutionContext({
      originalUrl: '/api/v1/health/live',
      headers: {},
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.validateAdminAccessToken).not.toHaveBeenCalled();
  });

  it('throws unauthorized when bearer token is missing', async () => {
    const authService = { validateAdminAccessToken: jest.fn() };
    const guard = new AdminGuard(authService as any);
    const context = makeExecutionContext({
      originalUrl: '/api/v1/admin/drivers/pending',
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws forbidden when token does not include admin claim', async () => {
    const authService = {
      validateAdminAccessToken: jest
        .fn()
        .mockRejectedValue(new ForbiddenException('admin role is required to access admin routes')),
    };
    const guard = new AdminGuard(authService as any);
    const context = makeExecutionContext({
      originalUrl: '/api/v1/admin/drivers/pending',
      headers: { authorization: 'Bearer user-token' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      'admin role is required to access admin routes',
    );
  });

  it('attaches authenticated admin user to request', async () => {
    const authService = {
      validateAdminAccessToken: jest.fn().mockResolvedValue({
        userId: 'admin-1',
        userType: 'ADMIN',
        role: 'admin',
        scopes: ['admin:*'],
      }),
    };
    const guard = new AdminGuard(authService as any);
    const request = {
      originalUrl: '/api/v1/admin/drivers/pending',
      headers: { authorization: 'Bearer admin-token' },
      user: undefined,
    };
    const context = makeExecutionContext(request);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      userId: 'admin-1',
      userType: 'ADMIN',
      role: 'admin',
      scopes: ['admin:*'],
    });
  });
});
