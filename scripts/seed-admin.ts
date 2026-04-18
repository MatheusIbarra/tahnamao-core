import * as argon2 from 'argon2';
import mongoose from 'mongoose';
import { AuthUserType, LoginDocumentType } from '../src/modules/identity/domain/auth.enums';
import {
  AuthAccountDocument,
  AuthAccountSchema,
} from '../src/modules/identity/infrastructure/mongo/schemas/auth-account.schema';

async function run(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  const adminId = process.env.ADMIN_SEED_ID ?? 'admin-seed-1';
  const adminEmail = (process.env.ADMIN_SEED_EMAIL ?? 'admin@tahnamao.local').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'Admin123456';

  await mongoose.connect(mongoUri);
  try {
    const AuthAccountModel = mongoose.model(AuthAccountDocument.name, AuthAccountSchema);
    const passwordHash = await argon2.hash(adminPassword);
    const now = new Date();

    await AuthAccountModel.updateOne(
      {
        userId: adminId,
        userType: AuthUserType.ADMIN,
      },
      {
        $set: {
          userId: adminId,
          userType: AuthUserType.ADMIN,
          loginDocumentType: LoginDocumentType.EMAIL,
          loginDocumentValue: adminEmail,
          passwordHash,
          passwordChangedAt: now,
          failedLoginCount: 0,
          lockedUntil: null,
          disabledAt: null,
        },
      },
      { upsert: true },
    );

    // eslint-disable-next-line no-console
    console.log(`Admin seed upserted: ${adminEmail} (${adminId})`);
  } finally {
    await mongoose.disconnect();
  }
}

void run();
