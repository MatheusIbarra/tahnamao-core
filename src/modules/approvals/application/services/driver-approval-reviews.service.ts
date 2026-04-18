import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DriverApprovalReviewStatus } from '../../domain/approval.enums';
import { DriverApprovalReviewDocument } from '../../infrastructure/mongo/schemas/driver-approval-review.schema';

export interface CreateDriverReviewInput {
  driverId: string;
  reviewStatus: DriverApprovalReviewStatus;
  adminId: string;
  reason?: string;
  notes?: string;
  checkedCpfMatch?: boolean;
  checkedFaceMatch?: boolean;
  checkedDocumentReadability?: boolean;
  checkedFraudSignals?: boolean;
}

@Injectable()
export class DriverApprovalReviewsService {
  constructor(
    @InjectModel(DriverApprovalReviewDocument.name)
    private readonly reviewModel: Model<DriverApprovalReviewDocument>,
  ) {}

  async createReview(input: CreateDriverReviewInput): Promise<void> {
    await this.reviewModel.create({
      ...input,
      createdAt: new Date(),
    });
  }

  async findLatestByDriverId(driverId: string): Promise<DriverApprovalReviewDocument | null> {
    return this.reviewModel.findOne({ driverId }).sort({ createdAt: -1 }).lean();
  }
}
