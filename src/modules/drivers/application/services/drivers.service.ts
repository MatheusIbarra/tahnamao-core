import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { DriverApprovalReviewsService } from '../../../approvals/application/services/driver-approval-reviews.service';
import { DriverApprovalReviewStatus } from '../../../approvals/domain/approval.enums';
import { AdminActionsAuditService } from '../../../audit/application/services/admin-actions-audit.service';
import { AdminAuditAction } from '../../../audit/domain/admin-action.enums';
import { FilesService } from '../../../files/application/services/files.service';
import { normalizeCpf, isValidCpf } from '../../../../shared/domain/utils/cpf.util';
import {
  DriverDocumentStatus,
  DriverDocumentType,
  DriverOnboardingStep,
  DriverRole,
  DriverStatus,
} from '../../domain/driver.enums';
import {
  DriverAssetDocument,
  DriverAssetHydratedDocument,
} from '../../infrastructure/mongo/schemas/driver-document.schema';
import { DriverDocument, DriverHydratedDocument } from '../../infrastructure/mongo/schemas/driver.schema';
import {
  CreateDriverDraftDto,
  RegisterDriverDocumentDto,
  UpdateDriverProfileDto,
} from '../dto/driver.dto';

const ALLOWED_DOCUMENT_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
const OFFICIAL_PHOTO_DOCUMENT_TYPES = new Set([DriverDocumentType.RG_FRONT, DriverDocumentType.CNH_FRONT]);

interface AdminDecisionInput {
  driverId: string;
  adminId: string;
  reason?: string;
  notes?: string;
  checkedCpfMatch?: boolean;
  checkedFaceMatch?: boolean;
  checkedDocumentReadability?: boolean;
  checkedFraudSignals?: boolean;
}

export type AdminDriversListStatus =
  | 'PENDENTE_APROVACAO'
  | 'DISPONIVEL'
  | 'EM_CORRIDA'
  | 'BLOQUEADO';

interface ListAdminDriversInput {
  status?: AdminDriversListStatus;
  search?: string;
  page: number;
  limit: number;
}

interface AdminDriverListItem {
  id: string;
  fullName: string;
  cpf: string;
  phone: string;
  status: string;
  createdAt?: Date;
}

function mapDriverStatusToAdminStatus(status: DriverStatus): string {
  switch (status) {
    case DriverStatus.PENDING_REVIEW:
      return 'PENDENTE_APROVACAO';
    case DriverStatus.APPROVED:
      return 'DISPONIVEL';
    case DriverStatus.BLOCKED:
      return 'BLOQUEADO';
    default:
      return status;
  }
}

@Injectable()
export class DriversService {
  constructor(
    @InjectModel(DriverDocument.name)
    private readonly driverModel: Model<DriverDocument>,
    @InjectModel(DriverAssetDocument.name)
    private readonly driverDocumentModel: Model<DriverAssetDocument>,
    private readonly filesService: FilesService,
    private readonly reviewsService: DriverApprovalReviewsService,
    private readonly adminActionsAuditService: AdminActionsAuditService,
  ) {}

  async createDraft(dto: CreateDriverDraftDto): Promise<{ driverId: string; status: DriverStatus }> {
    const now = new Date();
    const createdDriver = await this.driverModel.create({
      fullName: dto.fullName ?? 'Draft Driver',
      cpf: '00000000000',
      cpfNormalized: `draft-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      birthDate: now,
      phone: dto.phone ?? '0000000000',
      email: dto.email ?? `draft-${now.getTime()}@example.local`,
      role: DriverRole.DRIVER,
      status: DriverStatus.DRAFT,
      onboardingStep: DriverOnboardingStep.PROFILE,
      isActive: true,
      schemaVersion: 1,
      version: 0,
    });

    return {
      driverId: createdDriver.id,
      status: createdDriver.status,
    };
  }

  async updateProfile(driverId: string, dto: UpdateDriverProfileDto): Promise<void> {
    const driver = await this.driverModel.findById(driverId);
    if (!driver || driver.deletedAt) {
      throw new NotFoundException('driver not found');
    }
    if (driver.status === DriverStatus.BLOCKED || driver.status === DriverStatus.PENDING_REVIEW) {
      throw new ForbiddenException('driver profile cannot be changed in current status');
    }

    const cpfNormalized = normalizeCpf(dto.cpf);
    if (!isValidCpf(cpfNormalized)) {
      throw new BadRequestException('invalid CPF');
    }

    const duplicated = await this.driverModel.findOne({
      _id: { $ne: driver.id },
      cpfNormalized,
      deletedAt: { $exists: false },
    });
    if (duplicated) {
      throw new BadRequestException('CPF is already registered');
    }

    driver.fullName = dto.fullName.trim();
    driver.cpf = cpfNormalized;
    driver.cpfNormalized = cpfNormalized;
    driver.birthDate = new Date(dto.birthDate);
    driver.phone = dto.phone;
    driver.email = dto.email.toLowerCase();
    driver.onboardingStep = DriverOnboardingStep.PASSWORD;
    await driver.save();
  }

  async registerDocument(driverId: string, dto: RegisterDriverDocumentDto): Promise<{ version: number }> {
    const driver = await this.driverModel.findById(driverId);
    if (!driver || driver.deletedAt) {
      throw new NotFoundException('driver not found');
    }
    if (driver.status === DriverStatus.BLOCKED) {
      throw new ForbiddenException('driver is blocked');
    }
    if (driver.status === DriverStatus.PENDING_REVIEW) {
      throw new ForbiddenException('documents are locked while review is pending');
    }

    if (!ALLOWED_DOCUMENT_MIME_TYPES.has(dto.mimeType.toLowerCase())) {
      throw new BadRequestException('unsupported file format');
    }
    const fileSizeBytes = Number(dto.fileSizeBytes);
    if (!Number.isFinite(fileSizeBytes) || fileSizeBytes <= 0 || fileSizeBytes > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException('invalid file size');
    }

    await this.filesService.assertExists(dto.fileId);

    const cpfFromDocument = dto.extractedCpfNormalized
      ? normalizeCpf(dto.extractedCpfNormalized)
      : undefined;
    if (cpfFromDocument && cpfFromDocument !== driver.cpfNormalized) {
      throw new BadRequestException('document CPF does not match driver CPF');
    }
    if (dto.extractedFullName && dto.extractedFullName.trim().length > 0) {
      const normalizedName = dto.extractedFullName.trim().toLowerCase();
      if (!driver.fullName.toLowerCase().includes(normalizedName) && !normalizedName.includes(driver.fullName.toLowerCase())) {
        throw new BadRequestException('document name does not match driver name');
      }
    }

    const latest = await this.driverDocumentModel
      .findOne({ driverId, type: dto.type })
      .sort({ version: -1 });
    const nextVersion = (latest?.version ?? 0) + 1;

    await this.driverDocumentModel.create({
      driverId,
      type: dto.type,
      fileId: dto.fileId,
      mimeType: dto.mimeType.toLowerCase(),
      originalFileName: dto.originalFileName,
      status: DriverDocumentStatus.PENDING_REVIEW,
      version: nextVersion,
      extractedCpfNormalized: cpfFromDocument,
      extractedFullName: dto.extractedFullName?.trim(),
      schemaVersion: 1,
    });

    if (dto.type === DriverDocumentType.SELFIE) {
      driver.selfieFileId = dto.fileId;
      driver.onboardingStep = DriverOnboardingStep.SELFIE;
    } else {
      driver.onboardingStep = DriverOnboardingStep.DOCUMENTS;
    }
    await driver.save();

    return { version: nextVersion };
  }

  async submitOnboarding(driverId: string): Promise<void> {
    const driver = await this.driverModel.findById(driverId);
    if (!driver || driver.deletedAt) {
      throw new NotFoundException('driver not found');
    }
    if (driver.status === DriverStatus.BLOCKED) {
      throw new ForbiddenException('blocked driver cannot submit onboarding');
    }

    if (!isValidCpf(driver.cpfNormalized)) {
      throw new BadRequestException('profile CPF is invalid');
    }

    const latestDocs = await this.listLatestDocuments(driverId);
    const hasSelfie = latestDocs.some((doc) => doc.type === DriverDocumentType.SELFIE);
    const hasOfficialPhotoDocument = latestDocs.some((doc) =>
      OFFICIAL_PHOTO_DOCUMENT_TYPES.has(doc.type),
    );
    if (!hasSelfie || !hasOfficialPhotoDocument) {
      throw new BadRequestException('at least one official photo document and one selfie are required');
    }

    driver.status = DriverStatus.PENDING_REVIEW;
    driver.onboardingStep = DriverOnboardingStep.SUBMITTED;
    driver.rejectedAt = undefined;
    driver.rejectionReason = undefined;
    await driver.save();

    await this.reviewsService.createReview({
      driverId,
      reviewStatus: DriverApprovalReviewStatus.NEEDS_RESUBMISSION,
      adminId: 'system',
      notes: 'Driver submitted onboarding package for manual review.',
    });
  }

  async getOnboardingStatus(driverId: string): Promise<{
    driverId: string;
    status: DriverStatus;
    onboardingStep: DriverOnboardingStep;
    rejectionReason?: string;
  }> {
    const driver = await this.driverModel.findById(driverId).lean();
    if (!driver || driver.deletedAt) {
      throw new NotFoundException('driver not found');
    }

    return {
      driverId: String(driver._id),
      status: driver.status,
      onboardingStep: driver.onboardingStep,
      rejectionReason: driver.rejectionReason,
    };
  }

  async listPendingDrivers(
    page: number,
    pageSize: number,
  ): Promise<{ items: unknown[]; total: number }> {
    const safePage = Math.max(page, 1);
    const safePageSize = Math.min(Math.max(pageSize, 1), 100);
    const filter = {
      status: DriverStatus.PENDING_REVIEW,
      deletedAt: { $exists: false },
    };
    const [items, total] = await Promise.all([
      this.driverModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safePageSize)
        .limit(safePageSize)
        .lean(),
      this.driverModel.countDocuments(filter),
    ]);
    return { items, total };
  }

  async listAdminDrivers(input: ListAdminDriversInput): Promise<{
    items: AdminDriverListItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const safePage = Math.max(input.page, 1);
    const safeLimit = Math.min(Math.max(input.limit, 1), 100);
    const filter: FilterQuery<DriverDocument> = {
      deletedAt: { $exists: false },
    };

    if (input.status === 'PENDENTE_APROVACAO') {
      filter.status = DriverStatus.PENDING_REVIEW;
    } else if (input.status === 'DISPONIVEL') {
      filter.status = DriverStatus.APPROVED;
      filter.isActive = true;
    } else if (input.status === 'EM_CORRIDA') {
      // The MVP model has no explicit "in-ride" state; keep filter explicit and non-misleading.
      filter._id = { $exists: false };
    } else if (input.status === 'BLOQUEADO') {
      filter.status = DriverStatus.BLOCKED;
    }

    if (input.search?.trim()) {
      const search = input.search.trim();
      const normalizedSearch = search.replace(/\D/g, '');

      const searchFilter: FilterQuery<DriverDocument>[] = [
        { fullName: { $regex: search, $options: 'i' } },
      ];

      if (normalizedSearch.length > 0) {
        searchFilter.push(
          { cpfNormalized: { $regex: normalizedSearch } },
          { cpf: { $regex: normalizedSearch } },
        );
      }

      filter.$or = searchFilter;
    }

    const [items, total] = await Promise.all([
      this.driverModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .select('_id fullName cpf phone status createdAt')
        .lean(),
      this.driverModel.countDocuments(filter),
    ]);

    return {
      items: items.map((driver) => ({
        id: String(driver._id),
        fullName: driver.fullName,
        cpf: driver.cpf,
        phone: driver.phone,
        status: mapDriverStatusToAdminStatus(driver.status),
        createdAt: (driver as { createdAt?: Date }).createdAt,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getDriverReviewSnapshot(driverId: string): Promise<{
    driver: unknown;
    latestDocuments: unknown[];
  }> {
    const driver = await this.driverModel.findById(driverId).lean();
    if (!driver || driver.deletedAt) {
      throw new NotFoundException('driver not found');
    }
    const latestDocuments = await this.listLatestDocuments(driverId);
    return { driver, latestDocuments };
  }

  async approveDriver(input: AdminDecisionInput): Promise<void> {
    const driver = await this.mustLoadDriver(input.driverId);
    if (driver.status === DriverStatus.BLOCKED) {
      throw new BadRequestException('blocked driver must be unblocked before approval');
    }
    if (!input.reason?.trim()) {
      throw new BadRequestException('approval reason is required');
    }
    driver.status = DriverStatus.APPROVED;
    driver.approvedAt = new Date();
    driver.approvedByAdminId = input.adminId;
    driver.rejectedAt = undefined;
    driver.rejectionReason = undefined;
    await driver.save();

    await this.reviewsService.createReview({
      driverId: input.driverId,
      reviewStatus: DriverApprovalReviewStatus.APPROVED,
      adminId: input.adminId,
      reason: input.reason,
      notes: input.notes,
      checkedCpfMatch: input.checkedCpfMatch,
      checkedFaceMatch: input.checkedFaceMatch,
      checkedDocumentReadability: input.checkedDocumentReadability,
      checkedFraudSignals: input.checkedFraudSignals,
    });

    await this.adminActionsAuditService.log({
      adminId: input.adminId,
      targetId: input.driverId,
      action: AdminAuditAction.APPROVE_DRIVER,
      metadata: { reason: input.reason, notes: input.notes },
    });
  }

  async rejectDriver(input: AdminDecisionInput): Promise<void> {
    if (!input.reason?.trim()) {
      throw new BadRequestException('rejection reason is required');
    }
    const driver = await this.mustLoadDriver(input.driverId);
    driver.status = DriverStatus.REJECTED;
    driver.rejectedAt = new Date();
    driver.rejectionReason = input.reason;
    driver.approvedAt = undefined;
    driver.approvedByAdminId = undefined;
    await driver.save();

    await this.reviewsService.createReview({
      driverId: input.driverId,
      reviewStatus: DriverApprovalReviewStatus.REJECTED,
      adminId: input.adminId,
      reason: input.reason,
      notes: input.notes,
      checkedCpfMatch: input.checkedCpfMatch,
      checkedFaceMatch: input.checkedFaceMatch,
      checkedDocumentReadability: input.checkedDocumentReadability,
      checkedFraudSignals: input.checkedFraudSignals,
    });
    await this.adminActionsAuditService.log({
      adminId: input.adminId,
      targetId: input.driverId,
      action: AdminAuditAction.REJECT_DRIVER,
      metadata: { reason: input.reason, notes: input.notes },
    });
  }

  async blockDriver(input: AdminDecisionInput): Promise<void> {
    if (!input.reason?.trim()) {
      throw new BadRequestException('block reason is required');
    }
    const driver = await this.mustLoadDriver(input.driverId);
    driver.status = DriverStatus.BLOCKED;
    driver.blockedAt = new Date();
    driver.isActive = false;
    driver.rejectionReason = input.reason;
    await driver.save();

    await this.reviewsService.createReview({
      driverId: input.driverId,
      reviewStatus: DriverApprovalReviewStatus.BLOCKED,
      adminId: input.adminId,
      reason: input.reason,
      notes: input.notes,
      checkedCpfMatch: input.checkedCpfMatch,
      checkedFaceMatch: input.checkedFaceMatch,
      checkedDocumentReadability: input.checkedDocumentReadability,
      checkedFraudSignals: input.checkedFraudSignals,
    });
    await this.adminActionsAuditService.log({
      adminId: input.adminId,
      targetId: input.driverId,
      action: AdminAuditAction.BLOCK_DRIVER,
      metadata: { reason: input.reason, notes: input.notes },
    });
  }

  async unblockDriver(input: AdminDecisionInput): Promise<void> {
    const driver = await this.mustLoadDriver(input.driverId);
    if (driver.status !== DriverStatus.BLOCKED) {
      throw new BadRequestException('only blocked drivers can be unblocked');
    }
    driver.status = DriverStatus.APPROVED;
    driver.isActive = true;
    driver.blockedAt = undefined;
    await driver.save();

    await this.adminActionsAuditService.log({
      adminId: input.adminId,
      targetId: input.driverId,
      action: AdminAuditAction.UNBLOCK_DRIVER,
      metadata: { reason: input.reason, notes: input.notes },
    });
  }

  async approveDocument(
    driverId: string,
    documentId: string,
    adminId: string,
    reason?: string,
  ): Promise<void> {
    const document = await this.mustLoadDocument(driverId, documentId);
    document.status = DriverDocumentStatus.APPROVED;
    document.reviewedByAdminId = adminId;
    document.reviewedAt = new Date();
    document.rejectionReason = undefined;
    await document.save();

    await this.adminActionsAuditService.log({
      adminId,
      targetId: driverId,
      action: AdminAuditAction.APPROVE_DOCUMENT,
      metadata: { documentId, type: document.type, reason },
    });
  }

  async rejectDocument(
    driverId: string,
    documentId: string,
    adminId: string,
    reason: string,
  ): Promise<void> {
    if (!reason.trim()) {
      throw new BadRequestException('document rejection reason is required');
    }
    const document = await this.mustLoadDocument(driverId, documentId);
    document.status = DriverDocumentStatus.REJECTED;
    document.reviewedByAdminId = adminId;
    document.reviewedAt = new Date();
    document.rejectionReason = reason;
    await document.save();

    await this.adminActionsAuditService.log({
      adminId,
      targetId: driverId,
      action: AdminAuditAction.REJECT_DOCUMENT,
      metadata: { documentId, type: document.type, reason },
    });
  }

  private async mustLoadDriver(driverId: string): Promise<DriverHydratedDocument> {
    const driver = (await this.driverModel.findById(driverId).exec()) as DriverHydratedDocument | null;
    if (!driver || driver.deletedAt) {
      throw new NotFoundException('driver not found');
    }
    return driver;
  }

  private async mustLoadDocument(driverId: string, documentId: string): Promise<DriverAssetHydratedDocument> {
    const document = (await this.driverDocumentModel.findOne({
      _id: documentId,
      driverId,
    }).exec()) as DriverAssetHydratedDocument | null;
    if (!document) {
      throw new NotFoundException('driver document not found');
    }
    return document;
  }

  private async listLatestDocuments(driverId: string): Promise<DriverAssetDocument[]> {
    const docs = await this.driverDocumentModel
      .find({ driverId })
      .sort({ type: 1, version: -1, createdAt: -1 })
      .lean();
    const byType = new Map<DriverDocumentType, DriverAssetDocument>();
    for (const doc of docs) {
      if (!byType.has(doc.type)) {
        byType.set(doc.type, doc);
      }
    }
    return Array.from(byType.values());
  }
}
