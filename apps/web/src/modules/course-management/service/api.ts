import { config } from '@/config/environment';
import { handleHttpError } from '@/utils/apiError';
import type {
  CourseApiDto,
  CourseStatus,
  CreateCoursePayload,
  UpdateCoursePayload,
} from '../@types';

const COURSES_BASE_URL = `${config.apiUrl}/api/v1/courses`;

async function parseJson<TData>(res: Response): Promise<TData> {
  const body: { data?: TData; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);
  if (!res.ok) {
    handleHttpError(res.status, body);
  }
  return (body as { data: TData }).data;
}

async function assertOk(res: Response): Promise<void> {
  if (res.ok) return;
  const body: { message?: string } | undefined = await res.json().catch(() => undefined);
  handleHttpError(res.status, body);
}

export async function listCourses(status: CourseStatus): Promise<CourseApiDto[]> {
  const url = new URL(COURSES_BASE_URL);
  url.searchParams.set('status', status);
  const res = await fetch(url.toString());
  return parseJson<CourseApiDto[]>(res);
}

export async function createCourse(payload: CreateCoursePayload): Promise<CourseApiDto> {
  const res = await fetch(COURSES_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<CourseApiDto>(res);
}

export async function updateCourse(
  id: string,
  payload: UpdateCoursePayload,
): Promise<CourseApiDto> {
  const res = await fetch(`${COURSES_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<CourseApiDto>(res);
}

export async function updateCourseStatus(id: string, status: CourseStatus): Promise<CourseApiDto> {
  const res = await fetch(`${COURSES_BASE_URL}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return parseJson<CourseApiDto>(res);
}

export async function deleteCourse(id: string): Promise<void> {
  const res = await fetch(`${COURSES_BASE_URL}/${id}`, { method: 'DELETE' });
  return assertOk(res);
}
