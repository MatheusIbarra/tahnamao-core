import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AuthUserType, LoginDocumentType } from '../../../domain/auth.enums';

@Schema({ collection: 'auth_accounts', timestamps: true })
export class AuthAccountDocument {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, enum: AuthUserType, default: AuthUserType.DRIVER })
  userType!: AuthUserType;

  @Prop({ required: true, enum: LoginDocumentType, default: LoginDocumentType.CPF })
  loginDocumentType!: LoginDocumentType;

  @Prop({ required: true })
  loginDocumentValue!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  passwordChangedAt!: Date;

  @Prop({ required: true, default: 0 })
  failedLoginCount!: number;

  @Prop()
  lockedUntil?: Date;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  lastLoginIp?: string;

  @Prop()
  disabledAt?: Date;
}

export type AuthAccountHydratedDocument = HydratedDocument<AuthAccountDocument>;
export const AuthAccountSchema = SchemaFactory.createForClass(AuthAccountDocument);

AuthAccountSchema.index(
  {
    userType: 1,
    loginDocumentType: 1,
    loginDocumentValue: 1,
  },
  {
    unique: true,
    name: 'auth_accounts_unique_login_doc',
  },
);
AuthAccountSchema.index({ userId: 1, userType: 1 }, { unique: true, name: 'auth_accounts_unique_user' });
