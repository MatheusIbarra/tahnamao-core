import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { UsersModule } from './modules/users/users.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { FilesModule } from './modules/files/files.module';
import { FinanceModule } from './modules/finance/finance.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { WorkersModule } from './modules/workers/workers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MongoModule } from './shared/infrastructure/mongo/mongo.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    MongoModule,
    HealthModule,
    IdentityModule,
    UsersModule,
    ApprovalsModule,
    DeliveriesModule,
    DispatchModule,
    TrackingModule,
    PricingModule,
    DriversModule,
    AdminModule,
    AuditModule,
    FilesModule,
    FinanceModule,
    PayoutsModule,
    WorkersModule,
    NotificationsModule,
    CustomersModule,
    OrdersModule,
  ],
})
export class AppModule {}
