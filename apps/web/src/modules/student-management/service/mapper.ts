import type {
  Student,
  StudentApiDto,
  StudentFormValues,
  CreateStudentPayload,
  UpdateStudentPayload,
} from '../@types';

export function apiDtoToStudent(dto: StudentApiDto): Student {
  return {
    id: dto.id,
    studentId: dto.studentId,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    course: dto.course,
    status: dto.status,
    assignedOn: dto.assignedOn,
  };
}

export function formValuesToCreatePayload(values: StudentFormValues): CreateStudentPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    course: values.course,
  };
}

export function formValuesToUpdatePayload(values: StudentFormValues): UpdateStudentPayload {
  return {
    email: values.email.trim(),
    phone: values.phone.trim(),
    course: values.course,
  };
}
