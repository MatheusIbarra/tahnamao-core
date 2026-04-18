import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
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
}
