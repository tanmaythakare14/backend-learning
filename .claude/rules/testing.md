# Testing Rules

## Framework

Vitest + @testing-library/react. Always import from `@testing-library/react`, not from `react-dom/test-utils`.

```ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
```

## Test file location

All tests for a module go in `src/modules/<feature>/__tests__/`. Name files to match the component or function being tested:

```
src/modules/patient/__tests__/
├── PatientList.test.tsx
├── PatientDetail.test.tsx
├── EnrollPatient.test.tsx
├── patientApi.test.ts
└── patientMapper.test.ts
```

## Query priority

Prefer queries that reflect how users interact with the UI:

1. `getByRole` — first choice for interactive elements and landmarks
2. `getByLabelText` — for form inputs
3. `getByText` — for static text content
4. `getByTestId` — last resort, only when no semantic role applies

```tsx
// Correct
screen.getByRole('button', { name: /enroll patient/i });
screen.getByRole('table');
screen.getByLabelText(/first name/i);
screen.getByRole('alert');

// Avoid unless necessary
screen.getByTestId('patient-row-0');
```

## Async queries

Use `findBy*` for elements that appear after async operations. Never use `waitFor` with arbitrary timeouts.

```tsx
// Correct
const row = await screen.findByRole('row', { name: /john doe/i });

// Wrong — brittle, couples to implementation timing
await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument(), { timeout: 3000 });
```

## Mock API calls at the service module boundary

Mock the entire service module — not individual fetch calls, not the network:

```ts
// Correct — mocks at the module boundary
vi.mock('@/modules/patient/service/api', () => ({
  listPatients: vi.fn(),
  createPatient: vi.fn(),
}));

import { listPatients } from '@/modules/patient/service/api';

beforeEach(() => {
  vi.mocked(listPatients).mockResolvedValue({
    patients: [mockPatientDTO],
    total: 1,
    page: 1,
    pageSize: 20,
  });
});
```

## Reset mocks between tests

```ts
afterEach(() => {
  vi.clearAllMocks();
});
```

## Test structure

`describe` blocks group by behavior. Test names read as complete sentences.

```tsx
describe('PatientList', () => {
  describe('when the list loads successfully', () => {
    it('renders a row for each patient', async () => { ... });
    it('shows the patient MRN in each row', async () => { ... });
  });

  describe('when the API call fails', () => {
    it('shows an error toast', async () => { ... });
  });

  describe('when there are no patients', () => {
    it('shows an empty state message', async () => { ... });
  });
});
```

## Custom hook tests

Every custom hook must cover three cases:

```ts
describe('usePatientDetail', () => {
  it('returns loading state initially', () => { ... });
  it('returns patient data after successful fetch', async () => { ... });
  it('returns error message when fetch fails', async () => { ... });
});
```

Use `renderHook` from `@testing-library/react`:

```ts
import { renderHook, waitFor } from '@testing-library/react';

it('returns patient data after successful fetch', async () => {
  const { result } = renderHook(() => usePatientDetail('patient-123'));
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.data?.mrn).toBe('MRN001');
});
```

## Utility function tests

Cover edge cases: null input, empty arrays, boundary values, invalid input.

```ts
describe('patientDTOToListItem', () => {
  it('formats full name from first and last name', () => { ... });
  it('falls back to em dash when email is undefined', () => { ... });
  it('falls back to em dash when phone is undefined', () => { ... });
});
```

## What to test — not implementation details

Test what the user sees and does, not how the component is implemented internally.

```tsx
// Correct — tests user-observable behavior
it('shows a success message after enrolling a patient', async () => {
  render(<EnrollPatient />);
  await userEvent.type(screen.getByLabelText(/first name/i), 'John');
  await userEvent.click(screen.getByRole('button', { name: /enroll/i }));
  expect(await screen.findByText(/enrolled successfully/i)).toBeInTheDocument();
});

// Wrong — tests internal state
it('sets isSubmitting to true on submit', () => { ... });
```

## Never commit `.only` or `.skip`

```ts
// Both of these are forbidden in committed code
it.only('...', () => { ... });
it.skip('...', () => { ... });
describe.only('...', () => { ... });
```

## Snapshot tests

Avoid snapshot tests. If you must use one, add a comment explaining why the snapshot is intentional.

```ts
// Snapshot intentional: CPT code table column order is contractual with the billing API
expect(container).toMatchSnapshot();
```

## Test utilities

Put shared test helpers and mock data in `src/__tests__/utils/` or co-located in module `__tests__/`:

```ts
// __tests__/mocks.ts
export const mockPatientDTO: PatientDTO = {
  id: 'p-001',
  mrn: 'MRN001',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1980-01-15',
  gender: 'MALE',
};
```
