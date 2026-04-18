import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../../identity/application/services/auth.service';
import { SetDriverPasswordDto } from '../../../identity/application/dto/auth.dto';
import { CurrentAuthUser } from '../../../identity/presentation/http/decorators/current-auth-user.decorator';
import { JwtAuthGuard } from '../../../identity/presentation/http/guards/jwt-auth.guard';
import {
  CreateDriverDraftDto,
  DriverStatusResponseDto,
  RegisterDriverDocumentDto,
  SubmitDriverOnboardingDto,
  UpdateDriverProfileDto,
} from '../../application/dto/driver.dto';
import { DriversService } from '../../application/services/drivers.service';
import { DriverOperationalGuard } from './guards/driver-operational.guard';
import { DriverStatus } from '../../domain/driver.enums';

@ApiTags('Drivers')
@Controller('drivers')
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creates a draft onboarding for a driver' })
  @ApiResponse({ status: 201, description: 'Draft created.' })
  async createDraft(
    @Body() dto: CreateDriverDraftDto,
  ): Promise<{ driverId: string; status: DriverStatus; accessToken: string }> {
    const draft = await this.driversService.createDraft(dto);
    const accessToken = await this.authService.issueBootstrapAccessToken(draft.driverId, draft.status);
    return {
      ...draft,
      accessToken,
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates driver profile information' })
  @ApiResponse({ status: 200, description: 'Profile updated.' })
  async updateMe(
    @CurrentAuthUser() user: { userId: string },
    @Body() dto: UpdateDriverProfileDto,
  ): Promise<{ status: 'ok' }> {
    await this.driversService.updateProfile(user.userId, dto);
    return { status: 'ok' };
  }

  @Post('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sets or updates onboarding password for driver login' })
  @ApiResponse({ status: 201, description: 'Password set.' })
  async setPassword(
    @CurrentAuthUser() user: { userId: string },
    @Body() dto: SetDriverPasswordDto,
  ): Promise<{ status: 'ok' }> {
    await this.authService.setDriverPassword(user.userId, dto);
    return { status: 'ok' };
  }

  @Post('me/documents')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Uploads a new versioned document reference for the driver' })
  async uploadDocument(
    @CurrentAuthUser() user: { userId: string },
    @Body() dto: RegisterDriverDocumentDto,
  ): Promise<{ status: 'ok'; version: number }> {
    const result = await this.driversService.registerDocument(user.userId, dto);
    return {
      status: 'ok',
      version: result.version,
    };
  }

  @Post('me/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finalizes onboarding and sends driver to manual review' })
  @ApiResponse({ status: 200, description: 'Onboarding submitted.' })
  async submit(
    @CurrentAuthUser() user: { userId: string },
    @Body() _dto: SubmitDriverOnboardingDto,
  ): Promise<{ status: 'ok' }> {
    await this.driversService.submitOnboarding(user.userId);
    return { status: 'ok' };
  }

  @Get('me/onboarding-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Returns onboarding approval status for the current driver' })
  @ApiResponse({ status: 200, type: DriverStatusResponseDto })
  getStatus(@CurrentAuthUser() user: { userId: string }): Promise<DriverStatusResponseDto> {
    return this.driversService.getOnboardingStatus(user.userId);
  }

  @Post('me/documents/:type/resubmit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resubmits a document as a new version' })
  async resubmitDocument(
    @CurrentAuthUser() user: { userId: string },
    @Body() dto: RegisterDriverDocumentDto,
  ): Promise<{ status: 'ok'; version: number }> {
    const result = await this.driversService.registerDocument(user.userId, dto);
    return { status: 'ok', version: result.version };
  }

  @Get('me/operational-access')
  @UseGuards(JwtAuthGuard, DriverOperationalGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sample operational route protected by approved-driver guard' })
  @ApiResponse({ status: 200, description: 'Operational access granted.' })
  operationalAccess(): { access: 'granted' } {
    return { access: 'granted' };
  }
}
