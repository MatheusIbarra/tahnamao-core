import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'stored_files', timestamps: true })
export class StoredFileDocument {
  @Prop({ required: true, unique: true })
  fileId!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  sizeBytes!: number;

  @Prop({ required: true })
  originalFileName!: string;
}

export type StoredFileHydratedDocument = HydratedDocument<StoredFileDocument>;
export const StoredFileSchema = SchemaFactory.createForClass(StoredFileDocument);
