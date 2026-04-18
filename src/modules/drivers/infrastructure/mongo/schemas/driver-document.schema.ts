import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DriverDocumentStatus, DriverDocumentType } from '../../../domain/driver.enums';

@Schema({ collection: 'driver_documents', timestamps: true })
export class DriverAssetDocument {
  @Prop({ required: true })
  driverId!: string;

  @Prop({ required: true, enum: DriverDocumentType })
  type!: DriverDocumentType;

  @Prop({ required: true })
  fileId!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  originalFileName!: string;

  @Prop({ required: true, enum: DriverDocumentStatus, default: DriverDocumentStatus.PENDING_REVIEW })
  status!: DriverDocumentStatus;

  @Prop()
  reviewedByAdminId?: string;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop({ required: true })
  version!: number;

  @Prop()
  sha256?: string;

  @Prop()
  extractedCpfNormalized?: string;

  @Prop()
  extractedFullName?: string;

  @Prop({ required: true, default: 1 })
  schemaVersion!: number;
}

export type DriverAssetHydratedDocument = HydratedDocument<DriverAssetDocument>;
export const DriverDocumentSchema = SchemaFactory.createForClass(DriverAssetDocument);

DriverDocumentSchema.index(
  { driverId: 1, type: 1, version: 1 },
  { unique: true, name: 'driver_documents_unique_version' },
);
DriverDocumentSchema.index({ driverId: 1, type: 1, version: -1 }, { name: 'driver_documents_latest' });
DriverDocumentSchema.index({ status: 1, createdAt: -1 }, { name: 'driver_documents_status_timeline' });
