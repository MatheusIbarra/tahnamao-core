import { FilesController } from '@src/modules/files/presentation/http/files.controller';

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
});
