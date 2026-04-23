import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderPaymentMethod, OrderStatus } from '../../../domain/order.enums';

@Schema({ _id: false })
export class OrderItemSubdocument {
  @Prop({ required: true })
  menuItemId!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop()
  observation?: string;

  @Prop({ required: true, min: 0 })
  unitPrice!: number;

  @Prop({ required: true, min: 0 })
  subtotal!: number;

  @Prop()
  nameSnapshot?: string;

  @Prop({ min: 0, default: 0 })
  discountPercentSnapshot?: number;
}

@Schema({ _id: false })
export class DeliveryAddressSubdocument {
  @Prop({ required: true })
  street!: string;

  @Prop({ required: true })
  number!: string;

  @Prop()
  complement?: string;

  @Prop({ required: true })
  neighborhood!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  state!: string;

  @Prop({ required: true })
  zipCode!: string;

  @Prop({ required: true })
  lat!: number;

  @Prop({ required: true })
  lng!: number;

  @Prop()
  fullText?: string;
}

@Schema({ _id: false })
export class OrderStatusHistorySubdocument {
  @Prop({ enum: OrderStatus })
  from?: OrderStatus;

  @Prop({ required: true, enum: OrderStatus })
  status!: OrderStatus;

  @Prop({ required: true, default: Date.now })
  changedAt!: Date;
}

@Schema({ _id: false })
class OrderCustomerReviewSubdocument {
  @Prop({ required: true, min: 1, max: 5 })
  stars!: number;

  @Prop()
  comment?: string;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItemSubdocument);
const DeliveryAddressSchema = SchemaFactory.createForClass(DeliveryAddressSubdocument);
const OrderStatusHistorySchema = SchemaFactory.createForClass(OrderStatusHistorySubdocument);
const OrderCustomerReviewSchema = SchemaFactory.createForClass(OrderCustomerReviewSubdocument);

@Schema({ collection: 'orders', timestamps: true })
export class OrderDocument {
  @Prop({ required: true, unique: true })
  publicCode!: string;

  @Prop({ required: true })
  customerId!: string;

  @Prop({ required: true })
  restaurantId!: string;

  @Prop({ required: true, type: [OrderItemSchema], default: [] })
  items!: OrderItemSubdocument[];

  @Prop({ required: true, type: DeliveryAddressSchema })
  deliveryAddress!: DeliveryAddressSubdocument;

  @Prop({ required: true, enum: OrderPaymentMethod })
  paymentMethod!: OrderPaymentMethod;

  @Prop({ required: true, min: 0 })
  subtotal!: number;

  @Prop({ required: true, min: 0, default: 0 })
  deliveryFee!: number;

  @Prop({ required: true, min: 0 })
  totalAmount!: number;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Prop({ required: true, type: [OrderStatusHistorySchema], default: [] })
  statusHistory!: OrderStatusHistorySubdocument[];

  @Prop({ type: String, default: null })
  assignedDeliverer!: string | null;

  @Prop({ type: OrderCustomerReviewSchema })
  customerReview?: OrderCustomerReviewSubdocument;

  @Prop({ required: true, default: false })
  reviewPromptDismissed!: boolean;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  customerPhoneSnapshot?: string;

  @Prop()
  orderNotes?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type OrderHydratedDocument = HydratedDocument<OrderDocument>;
export const OrderSchema = SchemaFactory.createForClass(OrderDocument);

OrderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });
