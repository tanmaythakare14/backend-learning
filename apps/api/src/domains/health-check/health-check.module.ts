import { Module } from '@nestjs/common';
import { HealthCheckController } from './controller/health-check.controller';

@Module({
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
