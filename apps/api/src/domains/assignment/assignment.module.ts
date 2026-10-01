import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Assignment } from './entities/assignment.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizOption } from './entities/quiz-option.entity';
import { Submission } from './entities/submission.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { AssignmentRepository } from './repository/assignment.repository';
import { AssignmentService } from './service/assignment.service';
import { StudentIdentityService } from './service/student-identity.service';
import { AssignmentController } from './controller/assignment.controller';

/**
 * No validate() middleware here on purpose: POST /assignments/:id/submission can be
 * multipart, and multer only parses the body after middleware has run. The Joi
 * schemas in validator/ are applied inside AssignmentService instead.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assignment,
      QuizQuestion,
      QuizOption,
      Submission,
      QuizAttempt,
      Student,
    ]),
  ],
  providers: [AssignmentRepository, AssignmentService, StudentIdentityService],
  controllers: [AssignmentController],
})
export class AssignmentModule {}
