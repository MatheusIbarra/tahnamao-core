import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'idempotency_keys', timestamps: true })
export class IdempotencyKeyDocument {
  @Prop({ required: true })
  publicId!: string;

  @Prop({ required: true })
  scope!: string;

  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  requestHash!: string;

  @Prop({ required: true })
  requestedBy!: string;

  @Prop()
  responseCode?: number;

  @Prop({ type: Object })
  responseBody?: Record<string, unknown>;

  @Prop({ required: true, default: 1 })
  schemaVersion!: number;

  @Prop({ required: true, default: 0 })
  version!: number;

  @Prop({ required: true })
  expiresAt!: Date;
}

export type IdempotencyKeyHydratedDocument = HydratedDocument<IdempotencyKeyDocument>;
export const IdempotencyKeySchema = SchemaFactory.createForClass(IdempotencyKeyDocument);

IdempotencyKeySchema.index({ scope: 1, key: 1 }, { unique: true, name: 'uniq_scope_key' });
IdempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'ttl_expires_at' });
