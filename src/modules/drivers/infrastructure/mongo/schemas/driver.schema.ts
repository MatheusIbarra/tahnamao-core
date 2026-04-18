import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DriverOnboardingStep, DriverRole, DriverStatus } from '../../../domain/driver.enums';

@Schema({ collection: 'drivers', timestamps: true })
export class DriverDocument {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true })
  cpf!: string;

  @Prop({ required: true })
  cpfNormalized!: string;

  @Prop({ required: true })
  birthDate!: Date;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true, enum: DriverRole, default: DriverRole.DRIVER })
  role!: DriverRole;

  @Prop({ required: true, enum: DriverStatus, default: DriverStatus.DRAFT })
  status!: DriverStatus;

  @Prop({ required: true, enum: DriverOnboardingStep, default: DriverOnboardingStep.PROFILE })
  onboardingStep!: DriverOnboardingStep;

  @Prop({ required: true, default: true })
  isActive!: boolean;

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectedAt?: Date;

  @Prop()
  blockedAt?: Date;

  @Prop()
  approvedByAdminId?: string;

  @Prop()
  rejectionReason?: string;

  @Prop()
  profilePhotoFileId?: string;

  @Prop()
  selfieFileId?: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  deletedAt?: Date;

  @Prop({ required: true, default: 1 })
  schemaVersion!: number;

  @Prop({ required: true, default: 0 })
  version!: number;
}

export type DriverHydratedDocument = HydratedDocument<DriverDocument>;
export const DriverSchema = SchemaFactory.createForClass(DriverDocument);

DriverSchema.index(
  { cpfNormalized: 1 },
  {
    unique: true,
    partialFilterExpression: {
      deletedAt: { $exists: false },
    },
    name: 'drivers_unique_cpf_active',
  },
);
DriverSchema.index({ status: 1, createdAt: -1 }, { name: 'drivers_status_created_at' });
DriverSchema.index({ phone: 1 }, { name: 'drivers_phone_idx' });
DriverSchema.index({ email: 1 }, { name: 'drivers_email_idx' });
