# Module Structure Rules

## Every feature lives in `src/modules/<feature-name>/`

Never place business logic, API calls, or feature-specific types anywhere outside a module folder. The `src/` root and `src/components/` are for shared, cross-cutting code only.

## Required folder structure per module

```
src/modules/<feature>/
├── @types/
│   └── index.ts          # ALL TypeScript interfaces for this module
├── components/
│   ├── index.ts          # Barrel: re-exports everything from sub-folders
│   ├── list/             # Table/list view of the feature
│   ├── detail/           # Read-only detail/overview view
│   ├── form/             # Create or edit form (single-step)
│   └── management/       # Container that routes between list/form/detail
├── service/
│   ├── index.ts          # export * from './api'; export * from './mapper';
│   ├── api.ts            # All fetch/HTTP calls for this feature
│   └── mapper.ts         # DTO ↔ FormView ↔ ListItem transformations
├── constants/
│   └── index.ts          # Route paths, select options, named status constants
├── utils/
│   └── index.ts          # Pure helper functions (no side effects, no JSX)
├── __tests__/            # All test files for this module
└── index.ts              # Minimal public API — only what router/pages consume
```

## Multi-step forms get a `steps/` sub-folder

For flows like patient enrollment (5 steps) or onboarding:

```
components/
└── enrollment/
    ├── EnrollPatient.tsx      # Stepper orchestrator
    ├── steps/
    │   ├── DemographicsStep.tsx
    │   ├── InsuranceStep.tsx
    │   ├── EmergencyContactStep.tsx
    │   ├── ClinicalDetailsStep.tsx
    │   └── ConsentStep.tsx
    └── index.ts
```

## Tabbed detail views get a `tabs/` sub-folder

For patient detail with 8 tabs:

```
components/
└── detail/
    ├── PatientDetail.tsx      # Tab container
    ├── tabs/
    │   ├── vitals/
    │   ├── medications/
    │   ├── care-plan/
    │   ├── programs-devices/
    │   ├── activity-log/
    │   ├── billing/
    │   ├── appointments/
    │   └── tasks/
    └── index.ts
```

## Three layers — strictly separated

**UI layer** (`components/`): JSX only. No direct API calls, no `fetch`, no Redux dispatch for server data. Receives data via props or calls hooks.

**Service layer** (`service/`): Data fetching only. No JSX, no rendering logic, no React imports. Returns typed Promises.

**State layer** (`src/store/slices/`): Redux slices for auth and global UI state. Never put API response data in Redux — use component-local state.

## `service/index.ts` pattern

```ts
// service/index.ts — exactly this, nothing else
export * from './api';
export * from './mapper';
```

## `@types/index.ts` pattern

All interfaces for the module live here — DTOs (from API), FormView (for forms), ListItem (for tables), and component Props.

```ts
// DTO — shape from the API response
export interface PatientDTO {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO string from API
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  phone?: string;
}

// ListItem — shape used in the data table row
export interface PatientListItem {
  id: string;
  mrn: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  pcpName: string;
}

// FormView — shape used in RHF + Zod forms
export interface PatientEnrollmentFormView {
  firstName: string;
  lastName: string;
  mrn: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
}

// Component props
export interface PatientListProps {
  onEnroll: () => void;
}
```

## `index.ts` (module root) — minimal public API

Only export what the router or page-level components need to consume. Do not export internal sub-components or service functions from the module root.

```ts
// Good — exposes only the entry-point components + route constants
export { PatientList } from './components/list/PatientList';
export { PatientDetail } from './components/detail/PatientDetail';
export { EnrollPatient } from './components/enrollment/EnrollPatient';
export { PATIENT_BASE_PATH, PATIENT_DETAIL_PATH } from './constants';

// Wrong — never export internals from the module root
export { PatientRowActions } from './components/list/PatientRowActions';
export { patientApi } from './service/api';
```

## Barrel index pattern inside components

Each sub-folder must have its own `index.ts`:

```ts
// components/list/index.ts
export { PatientList } from './PatientList';
export { PatientListHeader } from './PatientListHeader';
export { PatientRowActions } from './PatientRowActions';

// components/index.ts
export * from './list';
export * from './detail';
export * from './enrollment';
```

## No cross-module imports

Never import from another module's internals:

```ts
// Wrong
import { patientApi } from '@/modules/patient/service/api'; // inside billing module

// Correct — shared logic belongs in src/hooks/ or src/utils/
import { formatPatientName } from '@/utils/patient';
```

## Constants pattern

```ts
// constants/index.ts
export const PATIENT_BASE_PATH = '/patients';
export const PATIENT_DETAIL_PATH = '/patients/:id';
export const PATIENT_ENROLL_PATH = '/patients/enroll';

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const PROGRAM_TYPE = {
  RPM: 'RPM',
  APCM: 'APCM',
} as const;
```
