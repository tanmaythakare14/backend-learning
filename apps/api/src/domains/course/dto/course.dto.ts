import type { CourseStatus } from '../entities/course.entity';

export interface CreateCourseDto {
  name: string;
  description: string;
  thumbnailUrl: string;
}

export interface UpdateCourseDto {
  name: string;
  description: string;
  thumbnailUrl: string;
}

export interface UpdateCourseStatusDto {
  status: CourseStatus;
}

export interface ListCoursesQuery {
  status?: string;
}

export interface CourseOutDto {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  enrolledOn: Date;
  totalLearners: number;
  status: CourseStatus;
}
