import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RestaurantAccountRole = 'OWNER' | 'STAFF';

@Schema({ collection: 'restaurant_accounts', timestamps: true })
export class RestaurantAccountDocument {
  @Prop({ required: true })
  restaurantId!: string;

  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, default: true })
  isActive!: boolean;

  @Prop({ required: true, default: 'OWNER' })
  role!: RestaurantAccountRole;

  @Prop()
  lastLoginAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export type RestaurantAccountHydratedDocument = HydratedDocument<RestaurantAccountDocument>;
export const RestaurantAccountSchema = SchemaFactory.createForClass(RestaurantAccountDocument);

RestaurantAccountSchema.index({ email: 1 }, { unique: true });
RestaurantAccountSchema.index({ phone: 1 }, { unique: true });
RestaurantAccountSchema.index({ restaurantId: 1 });
