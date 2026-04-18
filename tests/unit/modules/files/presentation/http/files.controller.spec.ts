import { FilesController } from '@src/modules/files/presentation/http/files.controller';
import { BadRequestException } from '@nestjs/common';

describe('FilesController', () => {
  it('registers file metadata and returns ok', async () => {
    const filesService = {
      register: jest.fn(),
    };
    const controller = new FilesController(filesService as any);

    const result = await controller.register({
      fileId: 'file-1',
      mimeType: 'image/png',
      originalFileName: 'document.png',
      sizeBytes: 1024,
    });

    expect(filesService.register).toHaveBeenCalledWith({
      fileId: 'file-1',
      mimeType: 'image/png',
      originalFileName: 'document.png',
      sizeBytes: 1024,
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('uploads file and returns generated fileId metadata', async () => {
    const filesService = {
      register: jest.fn(),
    };
    const controller = new FilesController(filesService as any);

    const result = await controller.upload({
      originalname: 'document.jpg',
      mimetype: 'image/jpeg',
      size: 312,
      buffer: Buffer.from('abc'),
    });

    expect(filesService.register).toHaveBeenCalledWith(
      expect.objectContaining({
        mimeType: 'image/jpeg',
        originalFileName: 'document.jpg',
        sizeBytes: 312,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        status: 'ok',
        mimeType: 'image/jpeg',
        originalFileName: 'document.jpg',
        sizeBytes: 312,
      }),
    );
    expect(result.fileId).toEqual(expect.any(String));
  });

  it('throws bad request when upload file is missing', async () => {
    const filesService = {
      register: jest.fn(),
    };
    const controller = new FilesController(filesService as any);

    await expect(controller.upload(undefined as any)).rejects.toBeInstanceOf(BadRequestException);
    expect(filesService.register).not.toHaveBeenCalled();
  });
});
