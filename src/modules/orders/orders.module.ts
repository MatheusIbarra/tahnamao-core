import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IdentityModule } from '../identity/identity.module';
import { OrdersService } from './application/services/orders.service';
import { MenuItemDocument, MenuItemSchema } from './infrastructure/mongo/schemas/menu-item.schema';
import { OrderDocument, OrderSchema } from './infrastructure/mongo/schemas/order.schema';
import { RestaurantDocument, RestaurantSchema } from './infrastructure/mongo/schemas/restaurant.schema';
import {
  RestaurantAccountDocument,
  RestaurantAccountSchema,
} from './infrastructure/mongo/schemas/restaurant-account.schema';
import { OrdersController } from './presentation/http/orders.controller';
import { OrdersGateway } from './presentation/websocket/orders.gateway';
import { CustomerDocument, CustomerSchema } from '../customers/infrastructure/mongo/schemas/customer.schema';
import { DriverDocument, DriverSchema } from '../drivers/infrastructure/mongo/schemas/driver.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('AUTH_ACCESS_TOKEN_SECRET') ?? 'local-dev-access-secret',
      }),
    }),
    MongooseModule.forFeature([
      { name: OrderDocument.name, schema: OrderSchema },
      { name: RestaurantDocument.name, schema: RestaurantSchema },
      { name: RestaurantAccountDocument.name, schema: RestaurantAccountSchema },
      { name: MenuItemDocument.name, schema: MenuItemSchema },
      { name: CustomerDocument.name, schema: CustomerSchema },
      { name: DriverDocument.name, schema: DriverSchema },
    ]),
    IdentityModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService],
})
export class OrdersModule {}
