# TypeScript Rules

## No `any`

Never use `any`. If the shape is unknown, use `unknown` and narrow it.

```ts
// Wrong
function parseApiResponse(data: any) { ... }

// Correct
function parseApiResponse(data: unknown): PatientDTO {
  if (!isPatientDTO(data)) throw new Error('Invalid patient data');
  return data;
}
```

## All interfaces in `@types/index.ts`

Every module has a single `@types/index.ts` file. All interfaces, types, and enums for that module go there. Never define interfaces inline in component files or API files.

```ts
// Wrong — inline interface in PatientList.tsx
interface Props {
  patients: Array<{ id: string; name: string }>;
}

// Correct — in @types/index.ts
export interface PatientListProps {
  patients: PatientListItem[];
}
```

## Explicit return types on all exported functions

```ts
// Correct
export function formatPatientName(patient: PatientDTO): string { ... }
export async function listPatients(params: PatientListParams): Promise<PatientListResponse> { ... }
export function PatientList({ patients }: PatientListProps): JSX.Element { ... }

// Wrong — relying on inference for public API
export function formatPatientName(patient: PatientDTO) { ... }
```

Internal (non-exported) helper functions may rely on inference if the return type is obvious.

## Zod schema is the source of truth for form types

Derive form value types from the Zod schema — never define them separately:

```ts
// Correct
const enrollPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  mrn: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  email: z.string().email().optional(),
});

type EnrollPatientFormValues = z.infer<typeof enrollPatientSchema>;

// Wrong — duplicate type definition
interface EnrollPatientFormValues {
  firstName: string;
  lastName: string;
  // ...
}
```

## Optional API fields

Fields that may be absent in API responses must be typed as optional — never assume they are present:

```ts
// Correct — reflects reality that API may not return these
export interface PatientDTO {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  email?: string; // optional in API
  phone?: string; // optional in API
  secondaryInsurance?: InsuranceDTO;
}

// Wrong — assuming always present
export interface PatientDTO {
  email: string; // will cause runtime errors
}
```

## No non-null assertions on API data

```ts
// Wrong — crashes if email is undefined
const email = patient.email!;

// Correct — handle the undefined case
const email = patient.email ?? '—';
const email = patient.email || 'Not provided';
```

## Redux slice state must have an explicit interface

```ts
// Correct
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { ... },
});
```

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
  data: PatientDTO | null;
  error: string | null;
}
```

## Enum-like constants use `as const`

```ts
// Correct
export const PROGRAM_TYPE = {
  RPM: 'RPM',
  APCM: 'APCM',
} as const;

export type ProgramType = (typeof PROGRAM_TYPE)[keyof typeof PROGRAM_TYPE];

// Avoid TypeScript enum keyword — it generates runtime code
enum ProgramType {
  RPM,
  APCM,
} // Wrong
```

## Type guards for narrowing

```ts
function isPatientDTO(value: unknown): value is PatientDTO {
  return typeof value === 'object' && value !== null && 'id' in value && 'mrn' in value && 'firstName' in value;
}
```

## No `as` casting on raw API responses

```ts
// Wrong — bypasses type safety
const patient = responseBody as PatientDTO;

// Correct — validate first
const patient = parsePatientDTO(responseBody); // throws if invalid
```
