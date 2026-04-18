import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AuthUserType } from '../../../domain/auth.enums';

@Schema({ collection: 'auth_refresh_tokens', timestamps: false })
export class AuthRefreshTokenDocument {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, enum: AuthUserType, default: AuthUserType.DRIVER })
  userType!: AuthUserType;

  @Prop({ required: true })
  refreshTokenHash!: string;

  @Prop()
  userAgent?: string;

  @Prop()
  ip?: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  revokedAt?: Date;

  @Prop()
  replacedByTokenId?: string;

  @Prop({ required: true, default: () => new Date() })
  createdAt!: Date;
}

export type AuthRefreshTokenHydratedDocument = HydratedDocument<AuthRefreshTokenDocument>;
export const AuthRefreshTokenSchema = SchemaFactory.createForClass(AuthRefreshTokenDocument);

AuthRefreshTokenSchema.index(
  { userId: 1, userType: 1, revokedAt: 1, expiresAt: 1 },
  { name: 'auth_refresh_tokens_active_lookup' },
);
AuthRefreshTokenSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    name: 'auth_refresh_tokens_ttl_expired',
  },
);
