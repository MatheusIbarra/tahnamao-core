import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AdminActionTargetType, AdminAuditAction } from '../../../domain/admin-action.enums';

@Schema({ collection: 'admin_actions_audit', timestamps: false })
export class AdminActionAuditDocument {
  @Prop({ required: true })
  adminId!: string;

  @Prop({ required: true, enum: AdminActionTargetType })
  targetType!: AdminActionTargetType;

  @Prop({ required: true })
  targetId!: string;

  @Prop({ required: true, enum: AdminAuditAction })
  action!: AdminAuditAction;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ required: true, default: () => new Date() })
  createdAt!: Date;
}

export type AdminActionAuditHydratedDocument = HydratedDocument<AdminActionAuditDocument>;
export const AdminActionAuditSchema = SchemaFactory.createForClass(AdminActionAuditDocument);

AdminActionAuditSchema.index({ targetType: 1, targetId: 1, createdAt: -1 }, { name: 'admin_actions_target_timeline' });
AdminActionAuditSchema.index({ adminId: 1, createdAt: -1 }, { name: 'admin_actions_admin_timeline' });
