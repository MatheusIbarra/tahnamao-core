import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from './application/services/files.service';
import { StoredFileDocument, StoredFileSchema } from './infrastructure/mongo/schemas/stored-file.schema';
import { FilesController } from './presentation/http/files.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StoredFileDocument.name,
        schema: StoredFileSchema,
      },
    ]),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
