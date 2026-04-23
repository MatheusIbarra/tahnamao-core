import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RestaurantStatus } from '../../../domain/order.enums';

@Schema({ _id: false })
class RestaurantAddressSubdocument {
  @Prop({ required: true })
  cep!: string;

  @Prop({ required: true })
  street!: string;

  @Prop({ required: true })
  number!: string;

  @Prop({ required: true })
  neighborhood!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  state!: string;

  @Prop()
  complement?: string;
}

@Schema({ _id: false })
class RestaurantDeliverySubdocument {
  @Prop({ required: true, min: 5, default: 35 })
  estimatedDeliveryMinutes!: number;

  @Prop({ required: true, default: '35 min' })
  estimatedTimeText!: string;

  @Prop({ required: true, min: 0, default: 0 })
  baseFeeCents!: number;

  @Prop({ required: true, min: 0, default: 0 })
  minOrderValueCents!: number;

  @Prop({ required: true, min: 0, default: 5 })
  radiusKm!: number;
}

@Schema({ _id: false })
class RestaurantOperatingHoursSubdocument {
  @Prop({ required: true, type: [Number], default: [0, 1, 2, 3, 4, 5, 6] })
  openWeekdays!: number[];

  @Prop({ required: true, default: '11:00' })
  openTime!: string;

  @Prop({ required: true, default: '22:00' })
  closeTime!: string;
}

@Schema({ _id: false })
class RestaurantMediaSubdocument {
  @Prop()
  logoUrl?: string;

  @Prop()
  bannerUrl?: string;
}

const RestaurantAddressSchema = SchemaFactory.createForClass(RestaurantAddressSubdocument);
const RestaurantDeliverySchema = SchemaFactory.createForClass(RestaurantDeliverySubdocument);
const RestaurantOperatingHoursSchema = SchemaFactory.createForClass(RestaurantOperatingHoursSubdocument);
const RestaurantMediaSchema = SchemaFactory.createForClass(RestaurantMediaSubdocument);

@Schema({ collection: 'restaurants', timestamps: true })
export class RestaurantDocument {
  @Prop({ required: true })
  name!: string;

  @Prop()
  ownerUserId?: string;

  @Prop()
  document?: string;

  @Prop()
  contactEmail?: string;

  @Prop()
  contactPhone?: string;

  @Prop({ type: RestaurantAddressSchema })
  address?: RestaurantAddressSubdocument;

  @Prop({ type: RestaurantDeliverySchema, default: {} })
  delivery!: RestaurantDeliverySubdocument;

  @Prop({ type: RestaurantOperatingHoursSchema, default: {} })
  operatingHours!: RestaurantOperatingHoursSubdocument;

  @Prop({ type: RestaurantMediaSchema, default: {} })
  media!: RestaurantMediaSubdocument;

  @Prop({ required: true, enum: RestaurantStatus })
  status!: RestaurantStatus;

  @Prop({ required: true, default: true })
  isActive!: boolean;

  @Prop({ required: true, default: 0, min: 0 })
  ratingSum!: number;

  @Prop({ required: true, default: 0, min: 0 })
  ratingCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type RestaurantHydratedDocument = HydratedDocument<RestaurantDocument>;
export const RestaurantSchema = SchemaFactory.createForClass(RestaurantDocument);

RestaurantSchema.index({ name: 1 });
