# Module Structure Rules

## Every feature lives in `src/modules/<feature-name>/`

Never place business logic, API calls, or feature-specific types anywhere outside a module folder. The `src/` root and `src/components/` are for shared, cross-cutting code only. Existing modules: `course-management`, `student-management`, `message`, `onboarding`.

## Required folder structure per module

```
src/modules/<feature>/
├── @types/
│   └── index.ts          # ALL TypeScript interfaces for this module
├── components/
│   ├── index.ts          # Barrel: re-exports everything from sub-folders
│   └── <sub-folders>/    # One folder per screen/concern — name by domain, not a fixed template
│                          #   (e.g. student-management has student-table/, student-form/,
│                          #   detail/, course-filter/ — not a rigid list/detail/form/management set)
├── service/
│   ├── index.ts          # export * from './api'; export * from './mapper';
│   ├── api.ts            # All fetch/HTTP calls for this feature
│   └── mapper.ts         # DTO ↔ FormView ↔ domain-shape transformations
├── constants/
│   └── index.ts          # Route paths, select options, named status constants
├── utils/
│   └── index.ts          # Pure helper functions (no side effects, no JSX)
├── __tests__/            # All test files for this module
└── index.ts              # Minimal public API — only what router/pages consume
```

Don't force a component sub-folder into `list/detail/form/management` naming if a more specific domain name is clearer — the point is one folder per distinct screen/concern with its own barrel `index.ts`, not the exact label.

## Multi-step forms get a `steps/` sub-folder

For flows like a multi-step onboarding or enrollment wizard:

```
components/
└── enrollment/
    ├── EnrollmentWizard.tsx   # Stepper orchestrator
    ├── steps/
    │   ├── DetailsStep.tsx
    │   ├── ContactStep.tsx
    │   └── ReviewStep.tsx
    └── index.ts
```

## Tabbed detail views get a `tabs/` sub-folder

For a detail screen with several tabs (e.g. a student or course detail with activity, documents, notes):

```
components/
└── detail/
    ├── StudentDetail.tsx      # Tab container
    ├── tabs/
    │   ├── overview/
    │   ├── activity-log/
    │   └── documents/
    └── index.ts
```

## Three layers — strictly separated

**UI layer** (`components/`): JSX only. No direct API calls, no `fetch`, no Redux dispatch for server data. Receives data via props or calls hooks.

**Service layer** (`service/`): Data fetching only. No JSX, no rendering logic, no React imports. Returns typed Promises.

**State layer** (`src/store/slices/`): Redux slices for global UI state only (see [state.md](state.md) — auth is handled by Auth0, not a Redux slice, in this project). Never put API response data in Redux — use component-local state.

## `service/index.ts` pattern

```ts
// service/index.ts — exactly this, plus any extra service files the module needs
export * from './api';
export * from './mapper';
```

## `@types/index.ts` pattern

All interfaces for the module live here — DTOs (from API), FormView (for forms), domain/list shapes, and component Props.

```ts
// DTO — raw shape from the API response
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
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
}

// Domain shape — used through the UI once mapped from the DTO
export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  status: StudentStatus;
  assignedOn: string;
  address: StudentAddress;
}

// FormView — shape used in RHF + Zod forms
export interface StudentFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  street: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
}

// Component props
export interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
}
```

## `index.ts` (module root) — minimal public API

Only export what the router or page-level components need to consume. Do not export internal sub-components or service functions from the module root.

```ts
// Good — exposes only the entry-point components (matches student-management/index.ts)
export { StudentManagementScreen, StudentDetailScreen } from './components';

// Wrong — never export internals from the module root
export { StudentRowActions } from './components/student-table/StudentRowActions';
export { listStudents } from './service/api';
```

## Barrel index pattern inside components

Each sub-folder must have its own `index.ts`:

```ts
// components/student-table/index.ts
export { StudentTable } from './StudentTable';
export { StudentRowActions } from './StudentRowActions';

// components/index.ts
export * from './student-table';
export * from './student-form';
export * from './detail';
```

## No cross-module imports

Never import another module's internals (service, components, or types) directly:

```ts
// Wrong
import { listCourses } from '@/modules/course-management/service/api'; // inside student-management

// Correct — if a module needs a small slice of another domain's data (e.g. the course
// dropdown on the student form), it defines its own minimal type and fetches it itself
// rather than importing course-management's service. See student-management's
// CourseSummaryDto in @types/index.ts for the existing example of this.

// Shared, non-domain logic belongs in src/hooks/ or src/utils/
import { formatFullName } from '@/utils/name';
```

## Constants pattern

```ts
// constants/index.ts
export const STUDENT_LIST_PATH = '/students';

export const STUDENT_STATUS_TABS: Array<{ value: StudentStatus; label: string }> = [
  { value: 'active', label: 'Active Students' },
  { value: 'deactivated', label: 'Deactivated Students' },
  { value: 'deleted', label: 'Deleted Students' },
];

export const ALL_STUDENT_STATUSES: StudentStatus[] = ['active', 'deactivated', 'deleted'];
```
