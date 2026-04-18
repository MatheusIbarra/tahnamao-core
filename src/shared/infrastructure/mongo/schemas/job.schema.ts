import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'jobs', timestamps: true })
export class JobDocument {
  @Prop({ required: true })
  publicId!: string;

  @Prop({ required: true })
  jobType!: string;

  @Prop({ required: true, enum: ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED'] })
  status!: string;

  @Prop({ required: true, type: Object })
  payload!: Record<string, unknown>;

  @Prop()
  deduplicationKey?: string;

  @Prop()
  scheduledTo?: Date;

  @Prop()
  startedAt?: Date;

  @Prop()
  finishedAt?: Date;

  @Prop()
  failureReason?: string;

  @Prop({ required: true, default: 1 })
  schemaVersion!: number;

  @Prop({ required: true, default: 0 })
  version!: number;
}

export type JobHydratedDocument = HydratedDocument<JobDocument>;
export const JobSchema = SchemaFactory.createForClass(JobDocument);

JobSchema.index({ status: 1, scheduledTo: 1 }, { name: 'job_status_schedule' });
JobSchema.index({ deduplicationKey: 1 }, { sparse: true, name: 'job_dedup_key' });
