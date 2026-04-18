import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { randomUUID } from 'crypto';
import { FilesService } from '../../application/services/files.service';

class RegisterStoredFileDto {
  @IsString()
  @IsNotEmpty()
  fileId!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsString()
  @IsNotEmpty()
  originalFileName!: string;

  @IsInt()
  @IsPositive()
  sizeBytes!: number;
}

class UploadStoredFileResponseDto {
  @IsString()
  status!: 'ok';

  @IsString()
  fileId!: string;

  @IsString()
  mimeType!: string;

  @IsString()
  originalFileName!: string;

  @IsInt()
  @IsPositive()
  sizeBytes!: number;
}

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Registers a file reference for onboarding flows' })
  @ApiResponse({ status: 201, description: 'File metadata registered.' })
  async register(@Body() dto: RegisterStoredFileDto): Promise<{ status: 'ok' }> {
    await this.filesService.register(dto);
    return { status: 'ok' };
  }

  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Uploads a file and registers metadata returning fileId' })
  @ApiResponse({ status: 201, type: UploadStoredFileResponseDto })
  async upload(
    @UploadedFile()
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ): Promise<UploadStoredFileResponseDto> {
    if (!file || !file.buffer || file.size <= 0) {
      throw new BadRequestException('file upload is required');
    }

    const fileId = randomUUID();
    await this.filesService.register({
      fileId,
      mimeType: file.mimetype,
      originalFileName: file.originalname,
      sizeBytes: file.size,
    });

    return {
      status: 'ok',
      fileId,
      mimeType: file.mimetype,
      originalFileName: file.originalname,
      sizeBytes: file.size,
    };
  }
}
