import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApprovalsModule } from '../approvals/approvals.module';
import { AuditModule } from '../audit/audit.module';
import { FilesModule } from '../files/files.module';
import { IdentityModule } from '../identity/identity.module';
import { DriversService } from './application/services/drivers.service';
import {
  DriverAssetDocument,
  DriverDocumentSchema,
} from './infrastructure/mongo/schemas/driver-document.schema';
import { DriverDocument, DriverSchema } from './infrastructure/mongo/schemas/driver.schema';
import { DriversController } from './presentation/http/drivers.controller';
import { DriverOperationalGuard } from './presentation/http/guards/driver-operational.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DriverDocument.name, schema: DriverSchema },
      { name: DriverAssetDocument.name, schema: DriverDocumentSchema },
    ]),
    IdentityModule,
    FilesModule,
    ApprovalsModule,
    AuditModule,
  ],
  controllers: [DriversController],
  providers: [DriversService, DriverOperationalGuard],
  exports: [DriversService],
})
export class DriversModule {}
