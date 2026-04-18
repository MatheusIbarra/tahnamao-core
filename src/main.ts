import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/presentation/http/filters/http-exception.filter';
import { CorrelationIdInterceptor } from './shared/presentation/http/interceptors/correlation-id.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new CorrelationIdInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('tahnamao-core')
    .setDescription('Core API for deliveries and future rides capabilities.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Server is running on port ${process.env.PORT ?? 3000}`);
  Logger.log(`Swagger is running on http://localhost:${process.env.PORT ?? 3000}/api/docs`);  Logger.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
}

void bootstrap();
