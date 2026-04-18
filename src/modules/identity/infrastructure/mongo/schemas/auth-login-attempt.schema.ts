import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AuthUserType, LoginDocumentType } from '../../../domain/auth.enums';

@Schema({ collection: 'auth_login_attempts', timestamps: false })
export class AuthLoginAttemptDocument {
  @Prop({ required: true, enum: AuthUserType, default: AuthUserType.DRIVER })
  userType!: AuthUserType;

  @Prop({ required: true, enum: LoginDocumentType, default: LoginDocumentType.CPF })
  loginDocumentType!: LoginDocumentType;

  @Prop({ required: true })
  loginDocumentValue!: string;

  @Prop()
  userId?: string;

  @Prop({ required: true })
  success!: boolean;

  @Prop()
  reason?: string;

  @Prop()
  ip?: string;

  @Prop()
  userAgent?: string;

  @Prop({ required: true, default: () => new Date() })
  createdAt!: Date;
}

export type AuthLoginAttemptHydratedDocument = HydratedDocument<AuthLoginAttemptDocument>;
export const AuthLoginAttemptSchema = SchemaFactory.createForClass(AuthLoginAttemptDocument);

AuthLoginAttemptSchema.index({ loginDocumentValue: 1, createdAt: -1 }, { name: 'auth_login_attempts_timeline' });
