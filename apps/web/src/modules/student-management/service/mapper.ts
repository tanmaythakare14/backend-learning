import type {
  Student,
  StudentApiDto,
  StudentFormValues,
  CreateStudentPayload,
  UpdateStudentPayload,
} from '../@types';
import { getCountryNameByCode, getStateNameByCode } from '../utils/location';

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
    address: {
      street: dto.streetAddress ?? undefined,
      city: dto.city ?? undefined,
      state: dto.state ?? undefined,
      zipCode: dto.zipCode ?? undefined,
      country: dto.country ?? undefined,
    },
  };
}

export function formValuesToCreatePayload(values: StudentFormValues): CreateStudentPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    course: values.course,
    streetAddress: values.street.trim(),
    city: values.city.trim(),
    state: getStateNameByCode(values.country, values.state),
    zipCode: values.zipCode.trim(),
    country: getCountryNameByCode(values.country),
  };
}

export function formValuesToUpdatePayload(values: StudentFormValues): UpdateStudentPayload {
  return {
    email: values.email.trim(),
    phone: values.phone.trim(),
    course: values.course,
    streetAddress: values.street.trim(),
    city: values.city.trim(),
    state: getStateNameByCode(values.country, values.state),
    zipCode: values.zipCode.trim(),
    country: getCountryNameByCode(values.country),
  };
}
