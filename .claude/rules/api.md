# API & Service Layer Rules

## All API calls live in `service/api.ts`

Never call `fetch` inside a component, a hook, or a Redux thunk directly. The service layer is the only place HTTP calls are made.

```
src/modules/<feature>/service/
├── index.ts     ← export * from './api'; export * from './mapper';
├── api.ts       ← all fetch calls
└── mapper.ts    ← DTO ↔ FormView ↔ ListItem transforms
```

## HTTP client

Use the project's existing `fetch`-based approach. Read the base URL from `src/config/environment.ts` (`config.apiUrl`) — never hardcode. Auth is handled by Auth0 (`@auth0/auth0-react`), not a bearer token you manage yourself — attach it via the existing `authHeaders()` helper (`src/utils/httpHeaders.ts`), which reads the token through `src/utils/authToken.ts` (populated once by `AuthTokenBridge`).

```ts
// src/config/environment.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  // ...
} as const;

// service/api.ts — correct pattern
import { config } from '@/config/environment';
import { authHeaders } from '@/utils/httpHeaders';
import { handleHttpError } from '@/utils/apiError';

export async function listStudents(params: ListStudentsParams): Promise<StudentApiDto[]> {
  const url = new URL(`${config.apiUrl}/api/v1/students`);
  url.searchParams.set('status', params.status);

  const res = await fetch(url.toString(), { headers: await authHeaders() });
  const body: { data?: StudentApiDto[]; message?: string } | undefined = await res
    .json()
    .catch(() => undefined);

  if (!res.ok) {
    handleHttpError(res.status, body);
  }

  return (body as { data: StudentApiDto[] }).data;
}
```

## Every API function must have an explicit return type

```ts
// Correct
export async function getStudent(id: string): Promise<StudentApiDto> { ... }
export async function createStudent(data: CreateStudentPayload): Promise<StudentApiDto> { ... }
export async function updateStudent(id: string, data: UpdateStudentPayload): Promise<StudentApiDto> { ... }
export async function deleteStudent(id: string): Promise<void> { ... }

// Wrong — inferred return types on async API functions
export async function getStudent(id: string) { ... }
```

## Response interfaces in `@types/index.ts`

Never define response types inline in `api.ts`:

```ts
// Wrong — inline interface in api.ts
async function listStudents(): Promise<{ data: Array<{ id: string; name: string }> }> { ... }

// Correct — interface in @types/index.ts
export interface StudentApiDto {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  status: StudentStatus;
  assignedOn: string;
}
```

## HTTP error handling

Handle status codes explicitly. Never swallow errors silently. This project's existing `handleHttpError` (`src/utils/apiError.ts`) takes the parsed response body too, because the backend's error middleware already returns a user-safe `message` for 4xx responses — reuse it rather than writing a new one per module:

```ts
// src/utils/apiError.ts — existing implementation, follow this shape for new error paths
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function handleHttpError(status: number, body?: { message?: string }): never {
  if (status === 401) {
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (status >= 500) {
    throw new ApiError('Something went wrong. Please try again later.', status);
  }
  throw new ApiError(body?.message ?? 'Request failed', status);
}
```

In the component/hook that calls the service, map the error to a user-friendly toast — never render raw error messages from the API response.

```ts
// In component or hook
try {
  await createStudent(payload);
  toast.success('Student added successfully');
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message); // already user-friendly from handleHttpError
  } else {
    toast.error('Something went wrong. Please try again.');
  }
}
```

## PII in API calls

Student contact fields (email, phone, address) must never appear in raw console logs. Use the project logger (`src/utils/logger.ts`), which redacts common PII patterns by default:

```ts
import { logger } from '@/utils/logger';

// Correct — logger auto-redacts PII patterns
logger.info('Fetching student', { studentId: id });

// Wrong — raw console.log with PII
console.log('Fetching student', { email: student.email, phone: student.phone });
```

## Mapper pattern

Every module that displays data in a table or form needs a `mapper.ts` to transform between API shapes and UI shapes:

```ts
// service/mapper.ts
import type { StudentApiDto, Student, StudentFormValues } from '../@types';

// DTO → domain/list shape
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

// FormView → CreatePayload (for POST request body)
export function formValuesToCreatePayload(values: StudentFormValues): CreateStudentPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    course: values.course,
    streetAddress: values.street.trim(),
    city: values.city.trim(),
    state: values.state,
    zipCode: values.zipCode.trim(),
    country: values.country,
  };
}
```

## API key naming convention

Group functions by entity and CRUD operation:

```ts
// service/api.ts
export async function listStudents(params: ListStudentsParams): Promise<StudentApiDto[]>;
export async function getStudent(id: string): Promise<StudentApiDto>;
export async function createStudent(data: CreateStudentPayload): Promise<StudentApiDto>;
export async function updateStudent(id: string, data: UpdateStudentPayload): Promise<StudentApiDto>;
export async function deleteStudent(id: string): Promise<void>;
```

## No cross-module imports for service calls

A module owns its own fetches even for data another module also serves — don't import another module's `service/api.ts` (see [modules.md](modules.md)):

```ts
// Wrong
import { listCourses } from '@/modules/course-management/service/api'; // inside student-management

// Correct — student-management defines its own minimal CourseSummaryDto and fetches
// GET /courses itself, rather than depending on course-management's service module.
```

## No API calls outside the service layer

```ts
// Wrong — fetch in a component
function StudentTable() {
  useEffect(() => {
    fetch('/api/v1/students').then(...);
  }, []);
}

// Wrong — fetch in a Redux thunk
createAsyncThunk('student/load', async () => {
  return await fetch('/api/v1/students').then(r => r.json());
});

// Correct — component calls service, service calls fetch
function StudentTable() {
  const [students, setStudents] = useState<Student[]>([]);
  useEffect(() => {
    listStudents({ status: 'active' }).then(res => setStudents(res.map(apiDtoToStudent)));
  }, []);
}
```
