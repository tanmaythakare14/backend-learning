import type {
  Course,
  CourseApiDto,
  CourseFormValues,
  CreateCoursePayload,
  UpdateCoursePayload,
} from '../@types';

export function apiDtoToCourse(dto: CourseApiDto): Course {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    thumbnailUrl: dto.thumbnailUrl,
    enrolledOn: dto.enrolledOn,
    totalLearners: dto.totalLearners,
    status: dto.status,
  };
}

export function formValuesToCreatePayload(values: CourseFormValues): CreateCoursePayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    thumbnailUrl: values.thumbnailUrl.trim(),
  };
}

export function formValuesToUpdatePayload(values: CourseFormValues): UpdateCoursePayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    thumbnailUrl: values.thumbnailUrl.trim(),
  };
}

export function courseToFormValues(course: Course | undefined): CourseFormValues {
  return {
    name: course?.name ?? '',
    description: course?.description ?? '',
    thumbnailUrl: course?.thumbnailUrl ?? '',
  };
}
