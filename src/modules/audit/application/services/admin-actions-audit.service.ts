import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminActionTargetType, AdminAuditAction } from '../../domain/admin-action.enums';
import { AdminActionAuditDocument } from '../../infrastructure/mongo/schemas/admin-action-audit.schema';

export interface LogAdminActionInput {
  adminId: string;
  targetId: string;
  action: AdminAuditAction;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AdminActionsAuditService {
  constructor(
    @InjectModel(AdminActionAuditDocument.name)
    private readonly adminActionsAuditModel: Model<AdminActionAuditDocument>,
  ) {}

  async log(input: LogAdminActionInput): Promise<void> {
    await this.adminActionsAuditModel.create({
      adminId: input.adminId,
      targetType: AdminActionTargetType.DRIVER,
      targetId: input.targetId,
      action: input.action,
      metadata: input.metadata,
      createdAt: new Date(),
    });
  }
}
