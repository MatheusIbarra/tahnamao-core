import { AdminAuthController } from '@src/modules/admin/presentation/http/admin-auth.controller';

describe('AdminAuthController', () => {
  const makeController = () => {
    const authService = {
      loginAdmin: jest.fn(),
    };

    const controller = new AdminAuthController(authService as any);
    return { controller, authService };
  };

  it('logs in an admin and returns bearer access token', async () => {
    const { controller, authService } = makeController();
    authService.loginAdmin.mockResolvedValue({ accessToken: 'admin-token' });

    const result = await controller.login(
      { email: 'admin@tahnamao.local', password: 'Admin123456' },
      { ip: '127.0.0.1', headers: { 'user-agent': 'jest-agent' } },
    );

    expect(authService.loginAdmin).toHaveBeenCalledWith(
      { email: 'admin@tahnamao.local', password: 'Admin123456' },
      { ip: '127.0.0.1', userAgent: 'jest-agent' },
    );
    expect(result).toEqual({
      accessToken: 'admin-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
    });
  });
});
