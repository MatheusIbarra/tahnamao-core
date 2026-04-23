import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DriversModule } from '../drivers/drivers.module';
import { AdminDriversController } from './presentation/http/admin-drivers.controller';
import { IdentityModule } from '../identity/identity.module';
import { AdminAuthController } from './presentation/http/admin-auth.controller';
import { AdminGuard } from './presentation/http/guards/admin.guard';
import { CustomersModule } from '../customers/customers.module';
import { AdminCustomersController } from './presentation/http/admin-customers.controller';
import { OrdersModule } from '../orders/orders.module';
import { AdminOrdersController } from './presentation/http/admin-orders.controller';

@Module({
  imports: [DriversModule, CustomersModule, OrdersModule, IdentityModule],
  controllers: [AdminDriversController, AdminCustomersController, AdminOrdersController, AdminAuthController],
  providers: [
    AdminGuard,
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
  ],
})
export class AdminModule {}
