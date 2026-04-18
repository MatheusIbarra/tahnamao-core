import { AuthController } from '@src/modules/identity/presentation/http/auth.controller';
import { AuthUserType } from '@src/modules/identity/domain/auth.enums';

describe('AuthController', () => {
  const makeController = () => {
    const authService = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    };

    const controller = new AuthController(authService as any);

    return { controller, authService };
  };

  it('returns bearer tokens on login', async () => {
    const { controller, authService } = makeController();
    authService.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = await controller.login(
      { cpf: '52998224725', password: 'Password123' },
      { ip: '127.0.0.1', headers: { 'user-agent': 'jest-agent' } },
    );

    expect(authService.login).toHaveBeenCalledWith(
      { cpf: '52998224725', password: 'Password123' },
      { ip: '127.0.0.1', userAgent: 'jest-agent' },
    );
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
    });
  });

  it('returns bearer tokens on refresh and handles array header values', async () => {
    const { controller, authService } = makeController();
    authService.refresh.mockResolvedValue({
      accessToken: 'access-token-2',
      refreshToken: 'refresh-token-2',
    });

    const result = await controller.refresh(
      { refreshToken: 'old-refresh-token' },
      { ip: '10.0.0.1', headers: { 'user-agent': ['agent-one', 'agent-two'] } },
    );

    expect(authService.refresh).toHaveBeenCalledWith(
      { refreshToken: 'old-refresh-token' },
      { ip: '10.0.0.1', userAgent: 'agent-one' },
      { restrictUserType: AuthUserType.DRIVER },
    );
    expect(result).toEqual({
      accessToken: 'access-token-2',
      refreshToken: 'refresh-token-2',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
    });
  });

  it('does not call logout service when authorization header is missing', async () => {
    const { controller, authService } = makeController();

    await controller.logout(
      {
        userId: 'driver-1',
        userType: 'DRIVER' as any,
        driverStatus: 'DRAFT' as any,
        scopes: [],
      },
      { allSessions: false },
      { headers: {} },
    );

    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('calls logout service with refresh token and allSessions flag', async () => {
    const { controller, authService } = makeController();

    await controller.logout(
      {
        userId: 'driver-2',
        userType: 'DRIVER' as any,
        driverStatus: 'APPROVED' as any,
        scopes: ['drivers:operational'],
      },
      { allSessions: true },
      {
        headers: {
          authorization: 'Bearer token',
          'x-refresh-token': ['refresh-value'],
        },
      },
    );

    expect(authService.logout).toHaveBeenCalledWith(
      {
        userId: 'driver-2',
        userType: 'DRIVER',
        driverStatus: 'APPROVED',
        scopes: ['drivers:operational'],
      },
      'refresh-value',
      true,
    );
  });
});
