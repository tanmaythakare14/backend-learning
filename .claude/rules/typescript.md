# TypeScript Rules

## Path aliases

Use `@/` for `src/` in all imports. Never use relative `../../` paths that cross module boundaries.

```ts
// Correct
import { listStudents } from '@/modules/student-management/service/api';
import { Button } from '@/components/ui/button';

// Wrong
import { listStudents } from '../../modules/student-management/service/api';
```

## No `any`

Never use `any`. If the shape is unknown, use `unknown` and narrow it.

```ts
// Wrong
function parseApiResponse(data: any) { ... }

// Correct
function parseApiResponse(data: unknown): StudentApiDto {
  if (!isStudentApiDto(data)) throw new Error('Invalid student data');
  return data;
}
```

## All interfaces in `@types/index.ts`

Every module has a single `@types/index.ts` file. All interfaces, types, and enums for that module go there. Never define interfaces inline in component files or API files.

```ts
// Wrong — inline interface in StudentTable.tsx
interface Props {
  students: Array<{ id: string; name: string }>;
}

// Correct — in @types/index.ts
export interface StudentTableProps {
  students: Student[];
}
```

## Explicit return types on all exported functions

```ts
// Correct
export function formatStudentName(student: Student): string { ... }
export async function listStudents(params: ListStudentsParams): Promise<StudentApiDto[]> { ... }
export function StudentTable({ students }: StudentTableProps): JSX.Element { ... }

// Wrong — relying on inference for public API
export function formatStudentName(student: Student) { ... }
```

Internal (non-exported) helper functions may rely on inference if the return type is obvious.

## Zod schema is the source of truth for form types

Derive form value types from the Zod schema — never define them separately:

```ts
// Correct
const studentFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  course: z.string().min(1),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

// Wrong — duplicate type definition
interface StudentFormValues {
  firstName: string;
  lastName: string;
  // ...
}
```

## Optional API fields

Fields that may be absent in API responses must be typed as optional (or nullable, matching what the API actually sends) — never assume they are present:

```ts
// Correct — reflects reality that the API returns these address fields as null when unset
export interface StudentApiDto {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string | null;
  city: string | null;
}

// Wrong — assuming always present
export interface StudentApiDto {
  streetAddress: string; // will cause runtime errors
}
```

## No non-null assertions on API data

```ts
// Wrong — crashes if streetAddress is null
const street = dto.streetAddress!;

// Correct — handle the null/undefined case
const street = dto.streetAddress ?? undefined;
const street = dto.streetAddress || 'Not provided';
```

## Redux slice state must have an explicit interface

```ts
// Correct
interface UiState {
  sidebarOpen: boolean;
  activeModal: string | null;
}

const initialState: UiState = {
  sidebarOpen: true,
  activeModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: { ... },
});
```

Note: this project's auth is Auth0-based, not a Redux `authSlice` — see [state.md](state.md).

## Discriminated unions for multi-state UI

For components with loading/error/success states, use a discriminated union rather than three separate booleans:

```ts
// Correct
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Wrong — boolean soup
interface ComponentState {
  isLoading: boolean;
  isError: boolean;
  data: Student | null;
  error: string | null;
}
```

## Enum-like constants use `as const`

```ts
// Correct
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  DEACTIVATED: 'deactivated',
  DELETED: 'deleted',
} as const;

export type StudentStatus = (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];

// Avoid TypeScript enum keyword — it generates runtime code
enum StudentStatus {
  Active,
  Deactivated,
} // Wrong
```

## Type guards for narrowing

```ts
function isStudentApiDto(value: unknown): value is StudentApiDto {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'studentId' in value &&
    'firstName' in value
  );
}
```

## Casting API responses

Prefer validating (or at least type-guarding) the actual DTO rather than casting it blind. The one narrow exception already used in this codebase's `service/api.ts` files: after checking `res.ok`, the _response envelope_ (`{ data: T }`) is cast, because that shape is a fixed backend contract, not user-controlled data — the DTO fields themselves aren't asserted beyond that.

```ts
// Acceptable — casting the known envelope shape after res.ok, matching existing api.ts files
if (!res.ok) handleHttpError(res.status, body);
return (body as { data: StudentApiDto[] }).data;

// Wrong — casting an entire untrusted payload with no res.ok check or shape guarantee
const student = responseBody as StudentApiDto;
```
