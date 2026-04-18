import { DriversController } from '@src/modules/drivers/presentation/http/drivers.controller';
import { DriverDocumentType } from '@src/modules/drivers/domain/driver.enums';

describe('DriversController', () => {
  const makeController = () => {
    const driversService = {
      createDraft: jest.fn(),
      updateProfile: jest.fn(),
      registerDocument: jest.fn(),
      submitOnboarding: jest.fn(),
      getOnboardingStatus: jest.fn(),
    };
    const authService = {
      issueBootstrapAccessToken: jest.fn(),
      setDriverPassword: jest.fn(),
    };

    const controller = new DriversController(driversService as any, authService as any);

    return { controller, driversService, authService };
  };

  it('creates a draft and includes bootstrap access token', async () => {
    const { controller, driversService, authService } = makeController();
    driversService.createDraft.mockResolvedValue({
      driverId: 'driver-1',
      status: 'DRAFT',
    });
    authService.issueBootstrapAccessToken.mockResolvedValue('bootstrap-token');

    const result = await controller.createDraft({
      fullName: 'Driver One',
      phone: '11999999999',
      email: 'driver@tahnamao.com',
    });

    expect(driversService.createDraft).toHaveBeenCalledWith({
      fullName: 'Driver One',
      phone: '11999999999',
      email: 'driver@tahnamao.com',
    });
    expect(authService.issueBootstrapAccessToken).toHaveBeenCalledWith('driver-1', 'DRAFT');
    expect(result).toEqual({
      driverId: 'driver-1',
      status: 'DRAFT',
      accessToken: 'bootstrap-token',
    });
  });

  it('updates profile for current user', async () => {
    const { controller, driversService } = makeController();

    const result = await controller.updateMe(
      { userId: 'driver-1' },
      {
        fullName: 'Driver Updated',
        cpf: '52998224725',
        birthDate: '1990-01-01',
        phone: '11988887777',
        email: 'updated@tahnamao.com',
      },
    );

    expect(driversService.updateProfile).toHaveBeenCalledWith('driver-1', {
      fullName: 'Driver Updated',
      cpf: '52998224725',
      birthDate: '1990-01-01',
      phone: '11988887777',
      email: 'updated@tahnamao.com',
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('sets driver password for current user', async () => {
    const { controller, authService } = makeController();

    const result = await controller.setPassword(
      { userId: 'driver-2' },
      { password: 'Password123', passwordConfirm: 'Password123' },
    );

    expect(authService.setDriverPassword).toHaveBeenCalledWith('driver-2', {
      password: 'Password123',
      passwordConfirm: 'Password123',
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('uploads document and returns generated version', async () => {
    const { controller, driversService } = makeController();
    driversService.registerDocument.mockResolvedValue({ version: 2 });

    const result = await controller.uploadDocument(
      { userId: 'driver-3' },
      {
        type: DriverDocumentType.SELFIE,
        fileId: 'file-1',
        mimeType: 'image/png',
        originalFileName: 'selfie.png',
        fileSizeBytes: '1200',
      },
    );

    expect(driversService.registerDocument).toHaveBeenCalledWith('driver-3', {
      type: DriverDocumentType.SELFIE,
      fileId: 'file-1',
      mimeType: 'image/png',
      originalFileName: 'selfie.png',
      fileSizeBytes: '1200',
    });
    expect(result).toEqual({ status: 'ok', version: 2 });
  });

  it('submits onboarding for current user', async () => {
    const { controller, driversService } = makeController();

    const result = await controller.submit({ userId: 'driver-4' }, { declarationAccepted: true });

    expect(driversService.submitOnboarding).toHaveBeenCalledWith('driver-4');
    expect(result).toEqual({ status: 'ok' });
  });

  it('returns onboarding status for current user', async () => {
    const { controller, driversService } = makeController();
    driversService.getOnboardingStatus.mockResolvedValue({
      driverId: 'driver-5',
      status: 'PENDING_REVIEW',
      onboardingStep: 'SUBMITTED',
    });

    const result = await controller.getStatus({ userId: 'driver-5' });

    expect(driversService.getOnboardingStatus).toHaveBeenCalledWith('driver-5');
    expect(result).toEqual({
      driverId: 'driver-5',
      status: 'PENDING_REVIEW',
      onboardingStep: 'SUBMITTED',
    });
  });

  it('resubmits document and returns new version', async () => {
    const { controller, driversService } = makeController();
    driversService.registerDocument.mockResolvedValue({ version: 3 });

    const result = await controller.resubmitDocument(
      { userId: 'driver-6' },
      {
        type: DriverDocumentType.RG_FRONT,
        fileId: 'file-2',
        mimeType: 'image/jpeg',
        originalFileName: 'rg-front.jpg',
        fileSizeBytes: '900',
      },
    );

    expect(driversService.registerDocument).toHaveBeenCalledWith('driver-6', {
      type: DriverDocumentType.RG_FRONT,
      fileId: 'file-2',
      mimeType: 'image/jpeg',
      originalFileName: 'rg-front.jpg',
      fileSizeBytes: '900',
    });
    expect(result).toEqual({ status: 'ok', version: 3 });
  });

  it('returns granted operational access payload', () => {
    const { controller } = makeController();

    expect(controller.operationalAccess()).toEqual({ access: 'granted' });
  });
});
