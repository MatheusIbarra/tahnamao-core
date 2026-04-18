import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ??
          'mongodb://localhost:27017/tahnamao-core',
        maxPoolSize: 30,
        minPoolSize: 5,
        retryWrites: true,
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class MongoModule {}
