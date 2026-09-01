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

Use the project's existing `fetch`-based approach. Read the base URL from `src/config/environment.ts` — never hardcode.

```ts
// src/config/environment.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL as string;

// service/api.ts — correct pattern
import { API_BASE_URL } from '@/config/environment';

export async function getPatients(params: PatientListParams): Promise<PatientListResponse> {
  const url = new URL(`${API_BASE_URL}/patients`);
  url.searchParams.set('page', String(params.page));

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!res.ok) {
    handleHttpError(res.status);
  }

  return res.json() as Promise<PatientListResponse>;
}
```

## Every API function must have an explicit return type

```ts
// Correct
export async function getPatientById(id: string): Promise<PatientDTO> { ... }
export async function createPatient(data: CreatePatientDTO): Promise<PatientDTO> { ... }
export async function updatePatient(id: string, data: UpdatePatientDTO): Promise<PatientDTO> { ... }
export async function deletePatient(id: string): Promise<void> { ... }

// Wrong — inferred return types on async API functions
export async function getPatientById(id: string) { ... }
```

## Response interfaces in `@types/index.ts`

Never define response types inline in `api.ts`:

```ts
// Wrong — inline interface in api.ts
async function getPatients(): Promise<{ patients: Array<{ id: string; name: string }> }> { ... }

// Correct — interface in @types/index.ts
export interface PatientListResponse {
  patients: PatientDTO[];
  total: number;
  page: number;
  pageSize: number;
}
```

## HTTP error handling

Handle all status codes explicitly. Never swallow errors silently.

```ts
function handleHttpError(status: number): never {
  if (status === 401) {
    // Redirect to login — do not expose to UI
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (status === 403) {
    throw new ApiError('You do not have permission to perform this action', status);
  }
  if (status >= 500) {
    throw new ApiError('Something went wrong. Please try again later.', status);
  }
  throw new ApiError('Request failed', status);
}
```

In the component/hook that calls the service, map the error to a user-friendly toast — never render raw error messages from the API response.

```ts
// In component or hook
try {
  await patientApi.createPatient(formData);
  toast.success('Patient enrolled successfully');
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message); // already user-friendly from handleHttpError
  } else {
    toast.error('Something went wrong. Please try again.');
  }
}
```

## PHI in API calls

PHI fields (MRN, DOB, SSN, insurance IDs, phone, email) must never appear in console logs. Use the project logger:

```ts
import { logger } from '@/utils/logger';

// Correct — logger auto-redacts PHI patterns
logger.info('Fetching patient', { patientId: id });

// Wrong — raw console.log with PHI
console.log('Fetching patient', { mrn: patient.mrn, dob: patient.dateOfBirth });
```

## Mapper pattern

Every module that displays data in a table or form needs a `mapper.ts` to transform between API shapes and UI shapes:

```ts
// service/mapper.ts
import type { PatientDTO, PatientListItem, PatientEnrollmentFormView } from '../@types';

// DTO → ListItem (for table rows)
export function patientDTOToListItem(dto: PatientDTO): PatientListItem {
  return {
    id: dto.id,
    mrn: dto.mrn,
    fullName: `${dto.firstName} ${dto.lastName}`,
    dateOfBirth: formatDate(dto.dateOfBirth),
    gender: dto.gender,
    email: dto.email ?? '—',
    phone: dto.phone ?? '—',
    pcpName: dto.primaryCarePhysician?.fullName ?? '—',
  };
}

// DTO → FormView (for pre-filling edit forms)
export function patientDTOToFormView(dto: PatientDTO): PatientEnrollmentFormView {
  return {
    firstName: dto.firstName,
    lastName: dto.lastName,
    mrn: dto.mrn,
    dateOfBirth: dto.dateOfBirth,
    email: dto.email ?? '',
    phone: dto.phone ?? '',
    gender: dto.gender,
  };
}

// FormView → CreateDTO (for POST request body)
export function formViewToCreateDTO(view: PatientEnrollmentFormView): CreatePatientDTO {
  return {
    firstName: view.firstName.trim(),
    lastName: view.lastName.trim(),
    mrn: view.mrn.trim(),
    dateOfBirth: view.dateOfBirth,
    email: view.email || undefined,
    phone: view.phone,
    gender: view.gender as PatientDTO['gender'],
  };
}
```

## API key naming convention

Group functions by entity and CRUD operation:

```ts
// service/api.ts
export async function listPatients(params: PatientListParams): Promise<PatientListResponse>;
export async function getPatient(id: string): Promise<PatientDTO>;
export async function createPatient(data: CreatePatientDTO): Promise<PatientDTO>;
export async function updatePatient(id: string, data: UpdatePatientDTO): Promise<PatientDTO>;
export async function deletePatient(id: string): Promise<void>;
export async function enrollPatient(data: EnrollPatientDTO): Promise<PatientDTO>;
```

## No API calls outside the service layer

```ts
// Wrong — fetch in a component
function PatientList() {
  useEffect(() => {
    fetch('/api/patients').then(...);
  }, []);
}

// Wrong — fetch in a Redux thunk
createAsyncThunk('patient/load', async () => {
  return await fetch('/api/patients').then(r => r.json());
});

// Correct — component calls service, service calls fetch
function PatientList() {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  useEffect(() => {
    listPatients({ page: 1 }).then(res => setPatients(res.patients.map(patientDTOToListItem)));
  }, []);
}
```
