import { HydratedDocument, Types } from 'mongoose';

export interface MongoBaseDocument {
  _id: Types.ObjectId;
  publicId: string;
  schemaVersion: number;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export type MongoHydratedDocument<T extends MongoBaseDocument> = HydratedDocument<T>;
