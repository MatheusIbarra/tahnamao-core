import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from '../identity/identity.module';
import { OrdersService } from './application/services/orders.service';
import { MenuItemDocument, MenuItemSchema } from './infrastructure/mongo/schemas/menu-item.schema';
import { OrderDocument, OrderSchema } from './infrastructure/mongo/schemas/order.schema';
import { RestaurantDocument, RestaurantSchema } from './infrastructure/mongo/schemas/restaurant.schema';
import { OrdersController } from './presentation/http/orders.controller';
import { OrdersGateway } from './presentation/websocket/orders.gateway';
import { CustomerDocument, CustomerSchema } from '../customers/infrastructure/mongo/schemas/customer.schema';
import { DriverDocument, DriverSchema } from '../drivers/infrastructure/mongo/schemas/driver.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderDocument.name, schema: OrderSchema },
      { name: RestaurantDocument.name, schema: RestaurantSchema },
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
