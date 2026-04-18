import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DomainError } from '../../../domain/errors/domain-error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<{ status: (code: number) => { json: (body: unknown) => void } }>();
    const request = context.getRequest<{ url: string; method: string; correlationId?: string }>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: exception.message,
        path: request.url,
        method: request.method,
        correlationId: request.correlationId,
      });
      return;
    }

    if (exception instanceof DomainError) {
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: exception.message,
        errorCode: exception.code,
        metadata: exception.metadata,
        path: request.url,
        method: request.method,
        correlationId: request.correlationId,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unexpected server error.',
      path: request.url,
      method: request.method,
      correlationId: request.correlationId,
    });
  }
}
