import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Student, StudentStatus } from '../entities/student.entity';

interface FindManyFilters {
  status: StudentStatus;
  courses?: string[];
  search?: string;
}

interface CreateStudentData {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
}

interface UpdateStudentData {
  email: string;
  phone: string;
  course: string;
}

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly repository: Repository<Student>,
  ) {}

  /** excludeId lets update() check "does anyone ELSE already have this email". */
  async findByEmail(email: string, excludeId?: string): Promise<Student | null> {
    return this.repository.findOne({
      where: excludeId ? { email, id: Not(excludeId) } : { email },
    });
  }

  async findById(id: string): Promise<Student | null> {
    return this.repository.findOne({ where: { id, status: Not('deleted') } });
  }

  async findMany(filters: FindManyFilters): Promise<Student[]> {
    const qb = this.repository
      .createQueryBuilder('student')
      .where('student.status = :status', { status: filters.status });

    if (filters.courses && filters.courses.length > 0) {
      qb.andWhere('student.course IN (:...courses)', { courses: filters.courses });
    }

    if (filters.search) {
      qb.andWhere(
        '(LOWER(student.first_name) LIKE :search OR LOWER(student.last_name) LIKE :search OR LOWER(student.email) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }

    return qb.orderBy('student.created_at', 'DESC').getMany();
  }

  /** Highest numeric suffix currently in use across student_id values (e.g. "STU-2415" -> 2415). */
  async getMaxStudentSequence(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('student')
      .select("MAX(CAST(SUBSTRING(student.student_id FROM '[0-9]+$') AS INTEGER))", 'max')
      .getRawOne<{ max: string | null }>();
    return result?.max ? parseInt(result.max, 10) : 2400;
  }

  async create(data: CreateStudentData): Promise<Student> {
    const student = this.repository.create({ ...data, status: 'active' });
    return this.repository.save(student);
  }

  async update(id: string, data: UpdateStudentData): Promise<Student | null> {
    await this.repository.update(id, { ...data, updatedAt: new Date() });
    return this.findById(id);
  }
}
