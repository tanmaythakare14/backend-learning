import { Injectable } from '@nestjs/common';
import { StudentRepository } from '../repository/student.repository';
import { LoggerService } from '../../../common/utils/logger.service';
import { AuditLogger } from '../../../common/utils/audit-logger.service';
import { ConflictException, NotFoundException } from '../../../common/exceptions';
import { CreateStudentDto, UpdateStudentDto, StudentOutDto } from '../dto/student.dto';
import { Student } from '../entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    private readonly repository: StudentRepository,
    private readonly logger: LoggerService,
    private readonly audit: AuditLogger,
  ) {}

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
