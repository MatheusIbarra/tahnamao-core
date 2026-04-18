import { ExecutionContext, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './presentation/http/auth.controller';
import { JwtAuthGuard } from './presentation/http/guards/jwt-auth.guard';
import { AuthAccountDocument, AuthAccountSchema } from './infrastructure/mongo/schemas/auth-account.schema';
import {
  AuthRefreshTokenDocument,
  AuthRefreshTokenSchema,
} from './infrastructure/mongo/schemas/auth-refresh-token.schema';
import {
  AuthLoginAttemptDocument,
  AuthLoginAttemptSchema,
} from './infrastructure/mongo/schemas/auth-login-attempt.schema';
import { DriverDocument, DriverSchema } from '../drivers/infrastructure/mongo/schemas/driver.schema';
import { CustomerDocument, CustomerSchema } from '../customers/infrastructure/mongo/schemas/customer.schema';

function shouldSkipThrottling(context: ExecutionContext): boolean {
  if (context.getType() !== 'http') {
    return false;
  }
  const request = context.switchToHttp().getRequest<{ originalUrl?: string; url?: string } | undefined>();
  if (!request) {
    return false;
  }
  const path = request.originalUrl ?? request.url ?? '';
  return path.startsWith('/api/docs');
}

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60_000,
          // Limite global alto o bastante para dev/Swagger; rotas sensíveis usam @Throttle mais restrito.
          limit: 600,
        },
      ],
      skipIf: shouldSkipThrottling,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('AUTH_ACCESS_TOKEN_SECRET') ?? 'local-dev-access-secret',
      }),
    }),
    MongooseModule.forFeature([
      { name: AuthAccountDocument.name, schema: AuthAccountSchema },
      { name: AuthRefreshTokenDocument.name, schema: AuthRefreshTokenSchema },
      { name: AuthLoginAttemptDocument.name, schema: AuthLoginAttemptSchema },
      { name: DriverDocument.name, schema: DriverSchema },
      { name: CustomerDocument.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class IdentityModule {}
