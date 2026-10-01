import { Injectable } from '@nestjs/common';
import { CourseRepository } from '../repository/course.repository';
import { LoggerService } from '../../../common/utils/logger.service';
import { AuditLogger } from '../../../common/utils/audit-logger.service';
import { BadRequestException, NotFoundException } from '../../../common/exceptions';
import { isValidUuid } from '../../../common/utils/uuid.util';
import { Course, CourseStatus } from '../entities/course.entity';
import {
  CourseOutDto,
  CreateCourseDto,
  UpdateCourseDto,
  UpdateCourseStatusDto,
  ListCoursesQuery,
} from '../dto/course.dto';

const VALID_STATUSES: CourseStatus[] = ['active', 'deactivated', 'deleted'];

@Injectable()
export class CourseService {
  constructor(
    private readonly repository: CourseRepository,
    private readonly logger: LoggerService,
    private readonly audit: AuditLogger,
  ) {}

  async findAll(query: ListCoursesQuery): Promise<CourseOutDto[]> {
    const status = (query.status ?? 'active') as CourseStatus;
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestException(
        `"${status}" is not a valid status — use one of: ${VALID_STATUSES.join(', ')}`,
      );
    }

    const courses = await this.repository.findMany(status);
    return courses.map((course) => this.toOutDto(course));
  }

  async create(data: CreateCourseDto): Promise<CourseOutDto> {
    const created = await this.repository.create(data);
    this.logger.info('New course created');
    this.audit.log('CourseService', 'Course created', { courseId: created.id }, 'info');
    return this.toOutDto(created);
  }

  async update(id: string, data: UpdateCourseDto): Promise<CourseOutDto> {
    await this.requireExisting(id);

    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    this.logger.info('Course details updated');
    this.audit.log('CourseService', 'Course updated', { courseId: id }, 'info');
    return this.toOutDto(updated);
  }

  async updateStatus(id: string, data: UpdateCourseStatusDto): Promise<CourseOutDto> {
    await this.requireExisting(id);

    const updated = await this.repository.updateStatus(id, data.status);
    if (!updated) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    this.logger.info(data.status === 'active' ? 'Course activated' : 'Course deactivated');
    this.audit.log(
      'CourseService',
      `Course status changed to ${data.status}`,
      { courseId: id },
      'info',
    );
    return this.toOutDto(updated);
  }

  async delete(id: string): Promise<CourseOutDto> {
    await this.requireExisting(id);

    const deleted = await this.repository.updateStatus(id, 'deleted');
    if (!deleted) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    this.logger.info('Course deleted');
    this.audit.log('CourseService', 'Course deleted', { courseId: id }, 'info');
    return this.toOutDto(deleted);
  }

  /** UUID format check + existence check, shared by update/updateStatus/delete. Excludes already-deleted courses — none of these three operations should apply to one. */
  private async requireExisting(id: string): Promise<Course> {
    if (!isValidUuid(id)) {
      throw new BadRequestException(`"${id}" is not a valid course id`);
    }
    const course = await this.repository.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  private toOutDto(course: Course): CourseOutDto {
    return {
      id: course.id,
      name: course.name,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      enrolledOn: course.enrolledOn,
      totalLearners: course.totalLearners,
      status: course.status,
    };
  }
}
