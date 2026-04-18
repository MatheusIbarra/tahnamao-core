import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DriverApprovalReviewDocument,
  DriverApprovalReviewSchema,
} from './infrastructure/mongo/schemas/driver-approval-review.schema';
import { DriverApprovalReviewsService } from './application/services/driver-approval-reviews.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DriverApprovalReviewDocument.name,
        schema: DriverApprovalReviewSchema,
      },
    ]),
  ],
  providers: [DriverApprovalReviewsService],
  exports: [DriverApprovalReviewsService],
})
export class ApprovalsModule {}
