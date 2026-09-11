import { config } from '@/config/environment';
import { handleHttpError } from '@/utils/apiError';
import type {
  StudentApiDto,
  CreateStudentPayload,
  UpdateStudentPayload,
  ListStudentsParams,
} from '../@types';

export async function listStudents(params: ListStudentsParams): Promise<StudentApiDto[]> {
  const url = new URL(`${config.apiUrl}/api/v1/students`);
  url.searchParams.set('status', params.status);
  if (params.course && params.course.length > 0) {
    url.searchParams.set('course', params.course.join(','));
  }
  if (params.search) {
    url.searchParams.set('search', params.search);
  }

  const res = await fetch(url.toString());
  const body: { data?: StudentApiDto[]; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: StudentApiDto[] }).data;
}

export async function getStudent(id: string): Promise<StudentApiDto> {
  const res = await fetch(`${config.apiUrl}/api/v1/students/${id}`);
  const body: { data?: StudentApiDto; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: StudentApiDto }).data;
}

export async function createStudent(payload: CreateStudentPayload): Promise<StudentApiDto> {
  const res = await fetch(`${config.apiUrl}/api/v1/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body: { data?: StudentApiDto; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: StudentApiDto }).data;
}

export async function updateStudent(
  id: string,
  payload: UpdateStudentPayload,
): Promise<StudentApiDto> {
  const res = await fetch(`${config.apiUrl}/api/v1/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body: { data?: StudentApiDto; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: StudentApiDto }).data;
}

export async function updateStudentStatus(
  id: string,
  status: 'active' | 'deactivated',
): Promise<StudentApiDto> {
  const res = await fetch(`${config.apiUrl}/api/v1/students/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  const body: { data?: StudentApiDto; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: StudentApiDto }).data;
}

export async function deleteStudent(id: string): Promise<StudentApiDto> {
  const res = await fetch(`${config.apiUrl}/api/v1/students/${id}`, { method: 'DELETE' });

  const body: { data?: StudentApiDto; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: StudentApiDto }).data;
}
