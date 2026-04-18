import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'customer_addresses', timestamps: true })
export class CustomerAddressDocument {
  @Prop({ required: true })
  customerId!: string;

  @Prop({ required: true })
  cep!: string;

  @Prop({ required: true })
  logradouro!: string;

  @Prop({ required: true })
  numero!: string;

  @Prop()
  complemento?: string;

  @Prop({ required: true })
  bairro!: string;

  @Prop({ required: true })
  cidade!: string;

  @Prop({ required: true })
  estado!: string;

  @Prop()
  apelido?: string;

  @Prop({ required: true, default: false })
  isDefault!: boolean;

  @Prop({ required: true, default: true })
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export type CustomerAddressHydratedDocument = HydratedDocument<CustomerAddressDocument>;
export const CustomerAddressSchema = SchemaFactory.createForClass(CustomerAddressDocument);

CustomerAddressSchema.index(
  { customerId: 1, isActive: 1, createdAt: -1 },
  { name: 'customer_addresses_by_customer_active_created_at' },
);
CustomerAddressSchema.index(
  { customerId: 1, isDefault: 1, isActive: 1 },
  { name: 'customer_addresses_customer_default_active' },
);
CustomerAddressSchema.index(
  { customerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDefault: true,
      isActive: true,
    },
    name: 'customer_addresses_unique_active_default',
  },
);
