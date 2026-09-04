import { Injectable } from '@nestjs/common';
import { StudentRepository } from '../repository/student.repository';
import { LoggerService } from '../../../common/utils/logger.service';
import { AuditLogger } from '../../../common/utils/audit-logger.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '../../../common/exceptions';
import { isValidUuid } from '../../../common/utils/uuid.util';
import {
  CreateStudentDto,
  UpdateStudentDto,
  ListStudentsQuery,
  StudentOutDto,
} from '../dto/student.dto';
import { Student, StudentStatus } from '../entities/student.entity';

const VALID_STATUSES: StudentStatus[] = ['active', 'deactivated', 'deleted'];

@Injectable()
export class StudentService {
  constructor(
    private readonly repository: StudentRepository,
    private readonly logger: LoggerService,
    private readonly audit: AuditLogger,
  ) {}

  async findAll(query: ListStudentsQuery): Promise<StudentOutDto[]> {
    const status = (query.status ?? 'active') as StudentStatus;
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestException(
        `"${status}" is not a valid status — use one of: ${VALID_STATUSES.join(', ')}`,
      );
    }

    const courses = Array.isArray(query.course)
      ? query.course
      : query.course
        ? query.course
            .split(',')
            .map((course) => course.trim())
            .filter(Boolean)
        : undefined;

    const students = await this.repository.findMany({ status, courses, search: query.search });
    return students.map((student) => this.toOutDto(student));
  }

  async create(data: CreateStudentDto): Promise<StudentOutDto> {
    const email = data.email.trim().toLowerCase();
    this.audit.log('StudentService', 'Student creation started', { email });

    const existing = await this.repository.findByEmail(email);
    if (existing) {
      throw new ConflictException('A student with this email already exists');
    }

    const nextSequence = (await this.repository.getMaxStudentSequence()) + 1;
    const studentId = `STU-${nextSequence}`;

    const created = await this.repository.create({
      studentId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email,
      phone: data.phone.trim(),
      course: data.course,
    });

    this.logger.info('New student enrolled');
    this.audit.log(
      'StudentService',
      'Student creation succeeded',
      { studentId: created.id },
      'info',
    );
    return this.toOutDto(created);
  }

  async update(id: string, data: UpdateStudentDto): Promise<StudentOutDto> {
    if (!isValidUuid(id)) {
      throw new BadRequestException(
        `"${id}" is not a valid student id — use the "id" field from the create/update response (a UUID), not the human-readable "studentId" (e.g. STU-2401)`,
      );
    }

    this.audit.log('StudentService', 'Student update started', { studentId: id });

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const email = data.email.trim().toLowerCase();
    const emailTaken = await this.repository.findByEmail(email, id);
    if (emailTaken) {
      throw new ConflictException('Another student is already using this email');
    }

    const updated = await this.repository.update(id, {
      email,
      phone: data.phone.trim(),
      course: data.course,
    });
    if (!updated) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    this.logger.info('Student details updated');
    this.audit.log('StudentService', 'Student update succeeded', { studentId: id }, 'info');
    return this.toOutDto(updated);
  }

  private toOutDto(student: Student): StudentOutDto {
    return {
      id: student.id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      course: student.course,
      status: student.status,
      assignedOn: student.assignedOn,
      createdAt: student.createdAt,
    };
  }
}
