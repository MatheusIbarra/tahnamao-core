import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CustomerStatus } from '../../../domain/customer.enums';

@Schema({ collection: 'customers', timestamps: true })
export class CustomerDocument {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  phoneNormalized!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, enum: CustomerStatus, default: CustomerStatus.ACTIVE })
  status!: CustomerStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export type CustomerHydratedDocument = HydratedDocument<CustomerDocument>;
export const CustomerSchema = SchemaFactory.createForClass(CustomerDocument);

CustomerSchema.index(
  { email: 1 },
  {
    unique: true,
    name: 'customers_unique_email',
  },
);
CustomerSchema.index(
  { phoneNormalized: 1 },
  {
    unique: true,
    name: 'customers_unique_phone',
  },
);
