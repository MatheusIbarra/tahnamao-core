import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from '../identity/identity.module';
import { CustomerAddressesService } from './application/services/customer-addresses.service';
import { CustomersService } from './application/services/customers.service';
import { ViaCepClient } from './infrastructure/http/viacep.client';
import { CustomerAddressDocument, CustomerAddressSchema } from './infrastructure/mongo/schemas/customer-address.schema';
import { CustomerDocument, CustomerSchema } from './infrastructure/mongo/schemas/customer.schema';
import { CustomersAuthController } from './presentation/http/customers-auth.controller';
import { CustomersController } from './presentation/http/customers.controller';
import { CustomerAuthGuard } from './presentation/http/guards/customer-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerDocument.name, schema: CustomerSchema },
      { name: CustomerAddressDocument.name, schema: CustomerAddressSchema },
    ]),
    IdentityModule,
  ],
  controllers: [CustomersController, CustomersAuthController],
  providers: [CustomersService, CustomerAddressesService, ViaCepClient, CustomerAuthGuard],
  exports: [CustomersService, CustomerAddressesService],
})
export class CustomersModule {}
