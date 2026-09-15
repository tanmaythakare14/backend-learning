import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Course, CourseStatus } from '../entities/course.entity';

interface CourseData {
  name: string;
  description: string;
  thumbnailUrl: string;
}

@Injectable()
export class CourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  async findById(id: string): Promise<Course | null> {
    return this.repository.findOne({ where: { id, status: Not('deleted') } });
  }

  /** Unlike findById(), includes deleted courses. */
  async findByIdAnyStatus(id: string): Promise<Course | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findMany(status: CourseStatus): Promise<Course[]> {
    return this.repository.find({ where: { status }, order: { createdAt: 'DESC' } });
  }

  async create(data: CourseData): Promise<Course> {
    const course = this.repository.create({ ...data, status: 'active', totalLearners: 0 });
    return this.repository.save(course);
  }

  async update(id: string, data: CourseData): Promise<Course | null> {
    await this.repository.update(id, { ...data, updatedAt: new Date() });
    return this.findById(id);
  }

  /** Shared by activate/deactivate (CourseStatus 'active'|'deactivated') and soft-delete ('deleted'). */
  async updateStatus(id: string, status: CourseStatus): Promise<Course | null> {
    await this.repository.update(id, { status, updatedAt: new Date() });
    return this.findByIdAnyStatus(id);
  }
}
