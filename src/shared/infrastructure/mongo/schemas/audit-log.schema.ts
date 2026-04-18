import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'audit_logs', timestamps: true })
export class AuditLogDocument {
  @Prop({ required: true })
  publicId!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  actorId!: string;

  @Prop({ required: true })
  actorRole!: string;

  @Prop({ required: true })
  resource!: string;

  @Prop({ required: true })
  resourceId!: string;

  @Prop({ type: Object })
  before?: Record<string, unknown>;

  @Prop({ type: Object })
  after?: Record<string, unknown>;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ required: true, default: 1 })
  schemaVersion!: number;

  @Prop({ required: true, default: 0 })
  version!: number;
}

export type AuditLogHydratedDocument = HydratedDocument<AuditLogDocument>;
export const AuditLogSchema = SchemaFactory.createForClass(AuditLogDocument);

AuditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 }, { name: 'audit_resource_timeline' });
AuditLogSchema.index({ actorId: 1, createdAt: -1 }, { name: 'audit_actor_timeline' });
