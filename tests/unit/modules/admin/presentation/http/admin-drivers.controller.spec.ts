import { AdminDriversController } from '@src/modules/admin/presentation/http/admin-drivers.controller';

describe('AdminDriversController', () => {
  const makeController = () => {
    const driversService = {
      listPendingDrivers: jest.fn(),
      getDriverReviewSnapshot: jest.fn(),
      approveDriver: jest.fn(),
      rejectDriver: jest.fn(),
      blockDriver: jest.fn(),
      unblockDriver: jest.fn(),
      approveDocument: jest.fn(),
      rejectDocument: jest.fn(),
    };

    const controller = new AdminDriversController(
      driversService as unknown as ConstructorParameters<typeof AdminDriversController>[0],
    );

    return { controller, driversService };
  };

  it('lists pending drivers with requested pagination', async () => {
    const { controller, driversService } = makeController();
    driversService.listPendingDrivers.mockResolvedValue({
      items: [{ id: 'driver-1' }],
      total: 1,
    });

    const result = await controller.listPending({ page: 2, pageSize: 10 });

    expect(driversService.listPendingDrivers).toHaveBeenCalledWith(2, 10);
    expect(result).toEqual({
      items: [{ id: 'driver-1' }],
      total: 1,
      page: 2,
      pageSize: 10,
    });
  });

  it('returns one driver review snapshot', async () => {
    const { controller, driversService } = makeController();
    driversService.getDriverReviewSnapshot.mockResolvedValue({
      driver: { id: 'driver-2' },
      latestDocuments: [{ id: 'doc-1' }],
    });

    const result = await controller.driverDetails('driver-2');

    expect(driversService.getDriverReviewSnapshot).toHaveBeenCalledWith('driver-2');
    expect(result).toEqual({
      driver: { id: 'driver-2' },
      latestDocuments: [{ id: 'doc-1' }],
    });
  });

  it('approves a driver', async () => {
    const { controller, driversService } = makeController();

    const result = await controller.approveDriver(
      'driver-3',
      { reason: 'Profile validated', checkedCpfMatch: true },
      'admin-1',
    );

    expect(driversService.approveDriver).toHaveBeenCalledWith({
      driverId: 'driver-3',
      adminId: 'admin-1',
      reason: 'Profile validated',
      checkedCpfMatch: true,
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('rejects a driver', async () => {
    const { controller, driversService } = makeController();

    const result = await controller.rejectDriver(
      'driver-4',
      { reason: 'Document mismatch', notes: 'Need clearer images' },
      'admin-2',
    );

    expect(driversService.rejectDriver).toHaveBeenCalledWith({
      driverId: 'driver-4',
      adminId: 'admin-2',
      reason: 'Document mismatch',
      notes: 'Need clearer images',
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('blocks a driver', async () => {
    const { controller, driversService } = makeController();

    const result = await controller.blockDriver(
      'driver-5',
      { reason: 'Fraud signals detected' },
      'admin-3',
    );

    expect(driversService.blockDriver).toHaveBeenCalledWith({
      driverId: 'driver-5',
      adminId: 'admin-3',
      reason: 'Fraud signals detected',
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('unblocks a driver', async () => {
    const { controller, driversService } = makeController();

    const result = await controller.unblockDriver(
      'driver-6',
      { reason: 'Manual unlock after verification' },
      'admin-4',
    );

    expect(driversService.unblockDriver).toHaveBeenCalledWith({
      driverId: 'driver-6',
      adminId: 'admin-4',
      reason: 'Manual unlock after verification',
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('approves a document', async () => {
    const { controller, driversService } = makeController();

    const result = await controller.approveDocument(
      'driver-7',
      'doc-approve',
      { reason: 'Readable and valid' },
      'admin-5',
    );

    expect(driversService.approveDocument).toHaveBeenCalledWith(
      'driver-7',
      'doc-approve',
      'admin-5',
      'Readable and valid',
    );
    expect(result).toEqual({ status: 'ok' });
  });

  it('rejects a document and defaults reason to empty string when omitted', async () => {
    const { controller, driversService } = makeController();

    const result = await controller.rejectDocument('driver-8', 'doc-reject', {}, 'admin-6');

    expect(driversService.rejectDocument).toHaveBeenCalledWith('driver-8', 'doc-reject', 'admin-6', '');
    expect(result).toEqual({ status: 'ok' });
  });
});
