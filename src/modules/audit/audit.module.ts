import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AdminActionAuditDocument,
  AdminActionAuditSchema,
} from './infrastructure/mongo/schemas/admin-action-audit.schema';
import { AdminActionsAuditService } from './application/services/admin-actions-audit.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AdminActionAuditDocument.name,
        schema: AdminActionAuditSchema,
      },
    ]),
  ],
  providers: [AdminActionsAuditService],
  exports: [AdminActionsAuditService],
})
export class AuditModule {}
