import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'menu_items', timestamps: true })
export class MenuItemDocument {
  @Prop({ required: true })
  restaurantId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, min: 0, max: 100, default: 0 })
  discountPercent!: number;

  @Prop({ required: true, default: true })
  available!: boolean;

  @Prop({ required: true, default: 0 })
  sortOrder!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type MenuItemHydratedDocument = HydratedDocument<MenuItemDocument>;
export const MenuItemSchema = SchemaFactory.createForClass(MenuItemDocument);

MenuItemSchema.index({ restaurantId: 1, available: 1 });
