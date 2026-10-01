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
  UpdateStudentStatusDto,
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

  async getById(id: string): Promise<StudentOutDto> {
    if (!isValidUuid(id)) {
      throw new BadRequestException(
        `"${id}" is not a valid student id — use the "id" field from the create/update response (a UUID), not the human-readable "studentId" (e.g. STU-2401)`,
      );
    }

    const student = await this.repository.findByIdAnyStatus(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return this.toOutDto(student);
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
      streetAddress: data.streetAddress.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      zipCode: data.zipCode.trim(),
      country: data.country.trim(),
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
    await this.requireExisting(id);
    this.audit.log('StudentService', 'Student update started', { studentId: id });

    const email = data.email.trim().toLowerCase();
    const emailTaken = await this.repository.findByEmail(email, id);
    if (emailTaken) {
      throw new ConflictException('Another student is already using this email');
    }

    const updated = await this.repository.update(id, {
      email,
      phone: data.phone.trim(),
      course: data.course,
      streetAddress: data.streetAddress.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      zipCode: data.zipCode.trim(),
      country: data.country.trim(),
    });
    if (!updated) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    this.logger.info('Student details updated');
    this.audit.log('StudentService', 'Student update succeeded', { studentId: id }, 'info');
    return this.toOutDto(updated);
  }

  async updateStatus(id: string, data: UpdateStudentStatusDto): Promise<StudentOutDto> {
    await this.requireExisting(id);

    const updated = await this.repository.updateStatus(id, data.status);
    if (!updated) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    this.logger.info(data.status === 'active' ? 'Student activated' : 'Student deactivated');
    this.audit.log(
      'StudentService',
      `Student status changed to ${data.status}`,
      { studentId: id },
      'info',
    );
    return this.toOutDto(updated);
  }

  async delete(id: string): Promise<StudentOutDto> {
    await this.requireExisting(id);

    const deleted = await this.repository.updateStatus(id, 'deleted');
    if (!deleted) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    this.logger.info('Student deleted');
    this.audit.log('StudentService', 'Student deleted', { studentId: id }, 'info');
    return this.toOutDto(deleted);
  }

  /** UUID format check + existence check, shared by update/updateStatus/delete. Excludes already-deleted students — none of these three operations should apply to one. */
  private async requireExisting(id: string): Promise<Student> {
    if (!isValidUuid(id)) {
      throw new BadRequestException(
        `"${id}" is not a valid student id — use the "id" field from the create/update response (a UUID), not the human-readable "studentId" (e.g. STU-2401)`,
      );
    }

    const student = await this.repository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
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
      streetAddress: student.streetAddress,
      city: student.city,
      state: student.state,
      zipCode: student.zipCode,
      country: student.country,
    };
  }
}
