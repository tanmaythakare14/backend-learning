import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { StudentRepository } from './repository/student.repository';
import { StudentService } from './service/student.service';
import { StudentController } from './controller/student.controller';
import { LoggerService } from '../../common/utils/logger.service';
import { validate } from '../../common/middleware/validate.middleware';
import {
  createStudentSchema,
  updateStudentSchema,
  updateStudentStatusSchema,
} from './validator/student.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  providers: [StudentRepository, StudentService, LoggerService],
  controllers: [StudentController],
  exports: [StudentService],
})
export class StudentModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(validate(createStudentSchema))
      .forRoutes({ path: 'students', method: RequestMethod.POST });
    consumer
      .apply(validate(updateStudentSchema))
      .forRoutes({ path: 'students/:id', method: RequestMethod.PUT });
    consumer
      .apply(validate(updateStudentStatusSchema))
      .forRoutes({ path: 'students/:id/status', method: RequestMethod.PATCH });
  }
}
