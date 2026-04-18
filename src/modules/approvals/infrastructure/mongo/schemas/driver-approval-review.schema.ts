import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DriverApprovalReviewStatus } from '../../../domain/approval.enums';

@Schema({ collection: 'driver_approval_reviews', timestamps: false })
export class DriverApprovalReviewDocument {
  @Prop({ required: true })
  driverId!: string;

  @Prop({ required: true, enum: DriverApprovalReviewStatus })
  reviewStatus!: DriverApprovalReviewStatus;

  @Prop()
  reason?: string;

  @Prop()
  notes?: string;

  @Prop()
  checkedCpfMatch?: boolean;

  @Prop()
  checkedFaceMatch?: boolean;

  @Prop()
  checkedDocumentReadability?: boolean;

  @Prop()
  checkedFraudSignals?: boolean;

  @Prop({ required: true })
  adminId!: string;

  @Prop({ required: true, default: () => new Date() })
  createdAt!: Date;
}

export type DriverApprovalReviewHydratedDocument = HydratedDocument<DriverApprovalReviewDocument>;
export const DriverApprovalReviewSchema = SchemaFactory.createForClass(DriverApprovalReviewDocument);

DriverApprovalReviewSchema.index(
  { driverId: 1, createdAt: -1 },
  { name: 'driver_approval_reviews_timeline' },
);
