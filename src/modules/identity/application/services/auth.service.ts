import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { DriverDocument } from '../../../drivers/infrastructure/mongo/schemas/driver.schema';
import { DriverStatus } from '../../../drivers/domain/driver.enums';
import { AuthUserType, LoginDocumentType } from '../../domain/auth.enums';
import {
  AdminLoginDto,
  LoginDto,
  RefreshTokenDto,
  SetDriverPasswordDto,
} from '../dto/auth.dto';
import { AuthAccountDocument } from '../../infrastructure/mongo/schemas/auth-account.schema';
import { AuthRefreshTokenDocument } from '../../infrastructure/mongo/schemas/auth-refresh-token.schema';
import { normalizeCpf, isValidCpf } from '../../../../shared/domain/utils/cpf.util';
import { AuthLoginAttemptDocument } from '../../infrastructure/mongo/schemas/auth-login-attempt.schema';

const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;
const REFRESH_TOKEN_EXPIRY_SECONDS = 30 * 24 * 60 * 60;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_MINUTES = 15;

export interface AuthenticatedRequestUser {
  userId: string;
  userType: AuthUserType;
  driverStatus: DriverStatus;
  scopes: string[];
}

export interface AuthenticatedAdminUser {
  userId: string;
  userType: AuthUserType;
  role: 'admin';
  scopes: string[];
}

interface LoginContext {
  ip?: string;
  userAgent?: string;
}

interface RefreshOptions {
  restrictUserType?: AuthUserType;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AuthAccountDocument.name)
    private readonly authAccountModel: Model<AuthAccountDocument>,
    @InjectModel(AuthRefreshTokenDocument.name)
    private readonly refreshTokenModel: Model<AuthRefreshTokenDocument>,
    @InjectModel(AuthLoginAttemptDocument.name)
    private readonly loginAttemptModel: Model<AuthLoginAttemptDocument>,
    @InjectModel(DriverDocument.name)
    private readonly driverModel: Model<DriverDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async setDriverPassword(driverId: string, dto: SetDriverPasswordDto): Promise<void> {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('password and passwordConfirm must match');
    }

    const driver = await this.driverModel.findById(driverId);
    if (!driver || driver.deletedAt) {
      throw new NotFoundException('driver not found');
    }

    const passwordHash = await argon2.hash(dto.password);
    await this.authAccountModel.updateOne(
      {
        userId: driver.id,
        userType: AuthUserType.DRIVER,
        loginDocumentType: LoginDocumentType.CPF,
      },
      {
        $set: {
          loginDocumentValue: normalizeCpf(driver.cpf),
          passwordHash,
          passwordChangedAt: new Date(),
          failedLoginCount: 0,
          lockedUntil: null,
          disabledAt: null,
        },
      },
      { upsert: true },
    );
  }

  async issueBootstrapAccessToken(driverId: string, status: DriverStatus): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: driverId,
        ut: AuthUserType.DRIVER,
        ds: status,
        scp: this.resolveScopesByStatus(status),
      },
      {
        secret: this.configService.get<string>('AUTH_ACCESS_TOKEN_SECRET') ?? 'local-dev-access-secret',
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      },
    );
  }

  async login(dto: LoginDto, context: LoginContext): Promise<{ accessToken: string; refreshToken: string }> {
    const cpfNormalized = normalizeCpf(dto.cpf);
    if (!isValidCpf(cpfNormalized)) {
      await this.registerLoginAttempt({
        userType: AuthUserType.DRIVER,
        loginDocumentType: LoginDocumentType.CPF,
        loginDocumentValue: cpfNormalized,
        success: false,
        reason: 'CPF_INVALID_FORMAT',
        context,
      });
      throw new BadRequestException('invalid CPF');
    }

    const account = await this.authAccountModel.findOne({
      userType: AuthUserType.DRIVER,
      loginDocumentType: LoginDocumentType.CPF,
      loginDocumentValue: cpfNormalized,
    });

    if (!account || account.disabledAt) {
      await this.registerLoginAttempt({
        userType: AuthUserType.DRIVER,
        loginDocumentType: LoginDocumentType.CPF,
        loginDocumentValue: cpfNormalized,
        success: false,
        reason: 'ACCOUNT_NOT_FOUND',
        context,
      });
      throw new UnauthorizedException('invalid credentials');
    }

    if (account.lockedUntil && account.lockedUntil.getTime() > Date.now()) {
      await this.registerLoginAttempt({
        userType: AuthUserType.DRIVER,
        loginDocumentType: LoginDocumentType.CPF,
        loginDocumentValue: cpfNormalized,
        success: false,
        reason: 'ACCOUNT_TEMPORARILY_LOCKED',
        context,
        userId: account.userId,
      });
      throw new UnauthorizedException('account temporarily locked');
    }

    const driver = await this.driverModel.findById(account.userId);
    if (!driver || driver.deletedAt) {
      await this.registerLoginAttempt({
        userType: AuthUserType.DRIVER,
        loginDocumentType: LoginDocumentType.CPF,
        loginDocumentValue: cpfNormalized,
        success: false,
        reason: 'DRIVER_NOT_FOUND',
        context,
        userId: account.userId,
      });
      throw new UnauthorizedException('invalid credentials');
    }

    if (driver.status === DriverStatus.BLOCKED || !driver.isActive) {
      await this.registerLoginAttempt({
        userType: AuthUserType.DRIVER,
        loginDocumentType: LoginDocumentType.CPF,
        loginDocumentValue: cpfNormalized,
        success: false,
        reason: 'DRIVER_BLOCKED',
        context,
        userId: account.userId,
      });
      throw new ForbiddenException('driver is blocked');
    }

    const passwordMatches = await argon2.verify(account.passwordHash, dto.password);
    if (!passwordMatches) {
      const failedLoginCount = account.failedLoginCount + 1;
      const shouldLock = failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS;
      await this.authAccountModel.updateOne(
        { _id: account.id },
        {
          $set: {
            failedLoginCount,
            lockedUntil: shouldLock
              ? new Date(Date.now() + ACCOUNT_LOCK_MINUTES * 60 * 1000)
              : null,
          },
        },
      );
      await this.registerLoginAttempt({
        userType: AuthUserType.DRIVER,
        loginDocumentType: LoginDocumentType.CPF,
        loginDocumentValue: cpfNormalized,
        success: false,
        reason: 'INVALID_PASSWORD',
        context,
        userId: account.userId,
      });
      throw new UnauthorizedException('invalid credentials');
    }

    const now = new Date();
    await this.authAccountModel.updateOne(
      { _id: account.id },
      {
        $set: {
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: now,
          lastLoginIp: context.ip,
        },
      },
    );
    await this.driverModel.updateOne({ _id: driver.id }, { $set: { lastLoginAt: now } });

    const tokenPayload = {
      sub: driver.id,
      ut: AuthUserType.DRIVER,
      ds: driver.status,
      scp: this.resolveScopesByStatus(driver.status),
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get<string>('AUTH_ACCESS_TOKEN_SECRET') ?? 'local-dev-access-secret',
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    });
    const refreshToken = randomBytes(48).toString('base64url');
    await this.refreshTokenModel.create({
      userId: driver.id,
      userType: AuthUserType.DRIVER,
      refreshTokenHash: this.hashToken(refreshToken),
      userAgent: context.userAgent,
      ip: context.ip,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000),
      createdAt: new Date(),
    });
    await this.registerLoginAttempt({
      userType: AuthUserType.DRIVER,
      loginDocumentType: LoginDocumentType.CPF,
      loginDocumentValue: cpfNormalized,
      success: true,
      reason: 'SUCCESS',
      context,
      userId: account.userId,
    });

    return { accessToken, refreshToken };
  }

  async loginAdmin(dto: AdminLoginDto, context: LoginContext): Promise<{ accessToken: string; refreshToken: string }> {
    const emailNormalized = dto.email.trim().toLowerCase();
    const account = await this.authAccountModel.findOne({
      userType: AuthUserType.ADMIN,
      loginDocumentType: LoginDocumentType.EMAIL,
      loginDocumentValue: emailNormalized,
    });

    if (!account || account.disabledAt) {
      await this.registerLoginAttempt({
        userType: AuthUserType.ADMIN,
        loginDocumentType: LoginDocumentType.EMAIL,
        loginDocumentValue: emailNormalized,
        success: false,
        reason: 'ACCOUNT_NOT_FOUND',
        context,
      });
      throw new UnauthorizedException('invalid admin credentials');
    }

    if (account.lockedUntil && account.lockedUntil.getTime() > Date.now()) {
      await this.registerLoginAttempt({
        userType: AuthUserType.ADMIN,
        loginDocumentType: LoginDocumentType.EMAIL,
        loginDocumentValue: emailNormalized,
        success: false,
        reason: 'ACCOUNT_TEMPORARILY_LOCKED',
        context,
        userId: account.userId,
      });
      throw new UnauthorizedException('admin account temporarily locked');
    }

    const passwordMatches = await argon2.verify(account.passwordHash, dto.password);
    if (!passwordMatches) {
      const failedLoginCount = account.failedLoginCount + 1;
      const shouldLock = failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS;
      await this.authAccountModel.updateOne(
        { _id: account.id },
        {
          $set: {
            failedLoginCount,
            lockedUntil: shouldLock
              ? new Date(Date.now() + ACCOUNT_LOCK_MINUTES * 60 * 1000)
              : null,
          },
        },
      );
      await this.registerLoginAttempt({
        userType: AuthUserType.ADMIN,
        loginDocumentType: LoginDocumentType.EMAIL,
        loginDocumentValue: emailNormalized,
        success: false,
        reason: 'INVALID_PASSWORD',
        context,
        userId: account.userId,
      });
      throw new UnauthorizedException('invalid admin credentials');
    }

    await this.authAccountModel.updateOne(
      { _id: account.id },
      {
        $set: {
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          lastLoginIp: context.ip,
        },
      },
    );
    await this.registerLoginAttempt({
      userType: AuthUserType.ADMIN,
      loginDocumentType: LoginDocumentType.EMAIL,
      loginDocumentValue: emailNormalized,
      success: true,
      reason: 'SUCCESS',
      context,
      userId: account.userId,
    });

    const accessToken = await this.jwtService.signAsync(
      {
        sub: account.userId,
        ut: AuthUserType.ADMIN,
        role: 'admin',
        scp: ['admin:*'],
      },
      {
        secret: this.configService.get<string>('AUTH_ACCESS_TOKEN_SECRET') ?? 'local-dev-access-secret',
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      },
    );

    const refreshToken = randomBytes(48).toString('base64url');
    await this.refreshTokenModel.create({
      userId: account.userId,
      userType: AuthUserType.ADMIN,
      refreshTokenHash: this.hashToken(refreshToken),
      userAgent: context.userAgent,
      ip: context.ip,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000),
      createdAt: new Date(),
    });

    return { accessToken, refreshToken };
  }

  async refresh(
    dto: RefreshTokenDto,
    context: LoginContext,
    options?: RefreshOptions,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshTokenHash = this.hashToken(dto.refreshToken);
    const persistedToken = await this.refreshTokenModel.findOne({ refreshTokenHash });
    if (
      !persistedToken ||
      persistedToken.revokedAt ||
      persistedToken.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('invalid refresh token');
    }

    if (options?.restrictUserType && persistedToken.userType !== options.restrictUserType) {
      throw new UnauthorizedException('invalid refresh token');
    }

    const newRefreshToken = randomBytes(48).toString('base64url');
    const now = new Date();
    await this.refreshTokenModel.updateOne(
      { _id: persistedToken.id },
      {
        $set: {
          revokedAt: now,
          replacedByTokenId: newRefreshToken.slice(0, 24),
        },
      },
    );
    await this.refreshTokenModel.create({
      userId: persistedToken.userId,
      userType: persistedToken.userType,
      refreshTokenHash: this.hashToken(newRefreshToken),
      ip: context.ip,
      userAgent: context.userAgent,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000),
      createdAt: now,
    });

    if (persistedToken.userType === AuthUserType.ADMIN) {
      const account = await this.authAccountModel.findOne({
        userId: persistedToken.userId,
        userType: AuthUserType.ADMIN,
        loginDocumentType: LoginDocumentType.EMAIL,
      });
      if (!account || account.disabledAt) {
        await this.refreshTokenModel.updateOne(
          { refreshTokenHash: this.hashToken(newRefreshToken) },
          { $set: { revokedAt: new Date() } },
        );
        throw new ForbiddenException('admin is not allowed to refresh');
      }

      const accessToken = await this.jwtService.signAsync(
        {
          sub: account.userId,
          ut: AuthUserType.ADMIN,
          role: 'admin',
          scp: ['admin:*'],
        },
        {
          secret: this.configService.get<string>('AUTH_ACCESS_TOKEN_SECRET') ?? 'local-dev-access-secret',
          expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
        },
      );

      return { accessToken, refreshToken: newRefreshToken };
    }

    const driver = await this.driverModel.findById(persistedToken.userId);
    if (!driver || driver.deletedAt || driver.status === DriverStatus.BLOCKED || !driver.isActive) {
      await this.refreshTokenModel.updateOne(
        { refreshTokenHash: this.hashToken(newRefreshToken) },
        { $set: { revokedAt: new Date() } },
      );
      throw new ForbiddenException('driver is not allowed to refresh');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: driver.id,
        ut: AuthUserType.DRIVER,
        ds: driver.status,
        scp: this.resolveScopesByStatus(driver.status),
      },
      {
        secret: this.configService.get<string>('AUTH_ACCESS_TOKEN_SECRET') ?? 'local-dev-access-secret',
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      },
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(user: AuthenticatedRequestUser, refreshToken?: string, allSessions = false): Promise<void> {
    if (allSessions) {
      await this.refreshTokenModel.updateMany(
        { userId: user.userId, userType: user.userType, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      return;
    }

    if (!refreshToken) {
      return;
    }
    await this.refreshTokenModel.updateOne(
      {
        userId: user.userId,
        userType: user.userType,
        refreshTokenHash: this.hashToken(refreshToken),
        revokedAt: null,
      },
      { $set: { revokedAt: new Date() } },
    );
  }

  async validateAccessToken(token: string): Promise<AuthenticatedRequestUser> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        ut: AuthUserType;
        ds: DriverStatus;
        scp: string[];
      }>(token, {
        secret: this.configService.get<string>('AUTH_ACCESS_TOKEN_SECRET') ?? 'local-dev-access-secret',
      });

      const driver = await this.driverModel.findById(payload.sub).lean();
      if (!driver || driver.deletedAt || driver.status === DriverStatus.BLOCKED || !driver.isActive) {
        throw new UnauthorizedException('driver no longer allowed');
      }

      return {
        userId: payload.sub,
        userType: payload.ut,
        driverStatus: driver.status,
        scopes: payload.scp,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('invalid access token');
    }
  }

  async validateAdminAccessToken(token: string): Promise<AuthenticatedAdminUser> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        ut: AuthUserType;
        role?: string;
        scp?: string[];
      }>(token, {
        secret: this.configService.get<string>('AUTH_ACCESS_TOKEN_SECRET') ?? 'local-dev-access-secret',
      });

      if (payload.ut !== AuthUserType.ADMIN || payload.role !== 'admin') {
        throw new ForbiddenException('admin role is required to access admin routes');
      }

      const account = await this.authAccountModel.findOne({
        userId: payload.sub,
        userType: AuthUserType.ADMIN,
        loginDocumentType: LoginDocumentType.EMAIL,
      }).lean();
      if (!account || account.disabledAt) {
        throw new UnauthorizedException('admin no longer allowed');
      }

      return {
        userId: payload.sub,
        userType: payload.ut,
        role: 'admin',
        scopes: payload.scp ?? ['admin:*'],
      };
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('invalid access token');
    }
  }

  private resolveScopesByStatus(status: DriverStatus): string[] {
    const baseScopes = ['drivers:status:read', 'drivers:profile:read'];
    switch (status) {
      case DriverStatus.DRAFT:
        return [...baseScopes, 'drivers:profile:write', 'drivers:documents:write'];
      case DriverStatus.PENDING_REVIEW:
        return baseScopes;
      case DriverStatus.REJECTED:
        return [...baseScopes, 'drivers:profile:write', 'drivers:documents:resubmit'];
      case DriverStatus.APPROVED:
        return [...baseScopes, 'drivers:profile:write', 'drivers:documents:write', 'drivers:operational'];
      case DriverStatus.BLOCKED:
      default:
        return [];
    }
  }

  private hashToken(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private async registerLoginAttempt(input: {
    userType: AuthUserType;
    loginDocumentType: LoginDocumentType;
    loginDocumentValue: string;
    success: boolean;
    reason: string;
    context: LoginContext;
    userId?: string;
  }): Promise<void> {
    await this.loginAttemptModel.create({
      userType: input.userType,
      loginDocumentType: input.loginDocumentType,
      loginDocumentValue: input.loginDocumentValue,
      success: input.success,
      reason: input.reason,
      userId: input.userId,
      ip: input.context.ip,
      userAgent: input.context.userAgent,
      createdAt: new Date(),
    });
  }
}
