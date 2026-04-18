import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AdminListDriversQueryDto,
  AdminDecisionDto,
  AdminDocumentDecisionDto,
  AdminListPendingDriversQueryDto,
} from '../../application/dto/admin-driver-review.dto';
import { AdminId } from './decorators/admin-id.decorator';
import { DriversService } from '../../../drivers/application/services/drivers.service';

@ApiTags('Admin Drivers')
@ApiBearerAuth()
@Controller('admin/drivers')
export class AdminDriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'Lists drivers with optional status and search filters' })
  @ApiResponse({ status: 200, description: 'Drivers list returned.' })
  listDrivers(
    @Query() query: AdminListDriversQueryDto,
  ): Promise<{ items: unknown[]; total: number; page: number; limit: number }> {
    return this.driversService.listAdminDrivers({
      status: query.status,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('pending')
  @ApiOperation({ summary: 'Lists pending driver applications for manual review' })
  @ApiResponse({ status: 200, description: 'Pending list returned.' })
  async listPending(
    @Query() query: AdminListPendingDriversQueryDto,
  ): Promise<{ items: unknown[]; total: number; page: number; pageSize: number }> {
    const result = await this.driversService.listPendingDrivers(query.page, query.pageSize);
    return {
      items: result.items,
      total: result.total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  @Get(':driverId')
  @ApiOperation({ summary: 'Returns a consolidated snapshot for one driver review' })
  driverDetails(
    @Param('driverId') driverId: string,
  ): Promise<{ driver: unknown; latestDocuments: unknown[] }> {
    return this.driversService.getDriverReviewSnapshot(driverId);
  }

  @Post(':driverId/approve')
  @ApiOperation({ summary: 'Approves a driver onboarding request' })
  async approveDriver(
    @Param('driverId') driverId: string,
    @Body() dto: AdminDecisionDto,
    @AdminId() adminId: string,
  ): Promise<{ status: 'ok' }> {
    await this.driversService.approveDriver({
      driverId,
      adminId,
      ...dto,
    });
    return { status: 'ok' };
  }

  @Post(':driverId/reject')
  @ApiOperation({ summary: 'Rejects a driver onboarding request' })
  async rejectDriver(
    @Param('driverId') driverId: string,
    @Body() dto: AdminDecisionDto,
    @AdminId() adminId: string,
  ): Promise<{ status: 'ok' }> {
    await this.driversService.rejectDriver({
      driverId,
      adminId,
      ...dto,
    });
    return { status: 'ok' };
  }

  @Post(':driverId/block')
  @ApiOperation({ summary: 'Blocks a driver from authentication and operations' })
  async blockDriver(
    @Param('driverId') driverId: string,
    @Body() dto: AdminDecisionDto,
    @AdminId() adminId: string,
  ): Promise<{ status: 'ok' }> {
    await this.driversService.blockDriver({
      driverId,
      adminId,
      ...dto,
    });
    return { status: 'ok' };
  }

  @Post(':driverId/unblock')
  @ApiOperation({ summary: 'Unblocks a driver and puts it back to review state' })
  async unblockDriver(
    @Param('driverId') driverId: string,
    @Body() dto: AdminDecisionDto,
    @AdminId() adminId: string,
  ): Promise<{ status: 'ok' }> {
    await this.driversService.unblockDriver({
      driverId,
      adminId,
      ...dto,
    });
    return { status: 'ok' };
  }

  @Post(':driverId/documents/:documentId/approve')
  @ApiOperation({ summary: 'Approves one uploaded driver document version' })
  async approveDocument(
    @Param('driverId') driverId: string,
    @Param('documentId') documentId: string,
    @Body() dto: AdminDocumentDecisionDto,
    @AdminId() adminId: string,
  ): Promise<{ status: 'ok' }> {
    await this.driversService.approveDocument(driverId, documentId, adminId, dto.reason);
    return { status: 'ok' };
  }

  @Post(':driverId/documents/:documentId/reject')
  @ApiOperation({ summary: 'Rejects one uploaded driver document version' })
  async rejectDocument(
    @Param('driverId') driverId: string,
    @Param('documentId') documentId: string,
    @Body() dto: AdminDocumentDecisionDto,
    @AdminId() adminId: string,
  ): Promise<{ status: 'ok' }> {
    await this.driversService.rejectDocument(driverId, documentId, adminId, dto.reason ?? '');
    return { status: 'ok' };
  }
}
