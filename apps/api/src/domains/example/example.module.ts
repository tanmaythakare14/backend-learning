import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Example } from './entities/example.entity';
import { ExampleRepository } from './repository/example.repository';
import { ExampleService } from './service/example.service';
import { ExampleController } from './controller/example.controller';
import { LoggerService } from '../../common/utils/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Example])],
  providers: [ExampleRepository, ExampleService, LoggerService],
  controllers: [ExampleController],
  exports: [ExampleService],
})
export class ExampleModule {}
