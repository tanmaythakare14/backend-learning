import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseRepository } from './repository/course.repository';
import { CourseService } from './service/course.service';
import { CourseController } from './controller/course.controller';
import { validate } from '../../common/middleware/validate.middleware';
import {
  createCourseSchema,
  updateCourseSchema,
  updateCourseStatusSchema,
} from './validator/course.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  providers: [CourseRepository, CourseService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(validate(createCourseSchema))
      .forRoutes({ path: 'courses', method: RequestMethod.POST });
    consumer
      .apply(validate(updateCourseSchema))
      .forRoutes({ path: 'courses/:id', method: RequestMethod.PUT });
    consumer
      .apply(validate(updateCourseStatusSchema))
      .forRoutes({ path: 'courses/:id/status', method: RequestMethod.PATCH });
  }
}
