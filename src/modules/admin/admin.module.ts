import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DriversModule } from '../drivers/drivers.module';
import { AdminDriversController } from './presentation/http/admin-drivers.controller';
import { IdentityModule } from '../identity/identity.module';
import { AdminAuthController } from './presentation/http/admin-auth.controller';
import { AdminGuard } from './presentation/http/guards/admin.guard';

@Module({
  imports: [DriversModule, IdentityModule],
  controllers: [AdminDriversController, AdminAuthController],
  providers: [
    AdminGuard,
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
  ],
})
export class AdminModule {}
