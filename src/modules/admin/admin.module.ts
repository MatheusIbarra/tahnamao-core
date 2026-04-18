import { Module } from '@nestjs/common';
import { DriversModule } from '../drivers/drivers.module';
import { AdminDriversController } from './presentation/http/admin-drivers.controller';
import { AdminHeaderGuard } from './presentation/http/guards/admin-header.guard';

@Module({
  imports: [DriversModule],
  controllers: [AdminDriversController],
  providers: [AdminHeaderGuard],
})
export class AdminModule {}
