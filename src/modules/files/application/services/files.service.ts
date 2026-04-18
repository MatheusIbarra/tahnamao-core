import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoredFileDocument } from '../../infrastructure/mongo/schemas/stored-file.schema';

interface RegisterFileInput {
  fileId: string;
  mimeType: string;
  originalFileName: string;
  sizeBytes: number;
}

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(StoredFileDocument.name)
    private readonly storedFileModel: Model<StoredFileDocument>,
  ) {}

  async register(input: RegisterFileInput): Promise<void> {
    await this.storedFileModel.updateOne(
      { fileId: input.fileId },
      {
        $set: {
          mimeType: input.mimeType,
          originalFileName: input.originalFileName,
          sizeBytes: input.sizeBytes,
        },
      },
      { upsert: true },
    );
  }

  async assertExists(fileId: string): Promise<void> {
    const exists = await this.storedFileModel.exists({ fileId });
    if (!exists) {
      throw new NotFoundException(`fileId ${fileId} was not found`);
    }
  }
}
