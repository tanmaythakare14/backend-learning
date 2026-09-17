# Testing Rules

## Framework

Jest (via Nx's `@nx/react` preset, `testEnvironment: 'jsdom'`) + `@testing-library/react`. Always import from `@testing-library/react`, not from `react-dom/test-utils`. Do not import from or add `vitest` — it is not a dependency in this workspace; `describe`/`it`/`expect`/`jest` are Jest globals and need no import.

```ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// describe/it/expect/jest are globals — no import needed
```

Run a single file via Nx, forwarding a pattern to the underlying jest run: `npx nx test web -- --testPathPattern=StudentList`.

## Test file location

All tests for a module go in `src/modules/<feature>/__tests__/`. Name files to match the component or function being tested:

```
src/modules/student-management/__tests__/
├── StudentTable.test.tsx
├── StudentDetailScreen.test.tsx
├── AddEditStudentDialog.test.tsx
├── studentApi.test.ts
└── studentMapper.test.ts
```

## Query priority

Prefer queries that reflect how users interact with the UI:

1. `getByRole` — first choice for interactive elements and landmarks
2. `getByLabelText` — for form inputs
3. `getByText` — for static text content
4. `getByTestId` — last resort, only when no semantic role applies

```tsx
// Correct
screen.getByRole('button', { name: /add student/i });
screen.getByRole('table');
screen.getByLabelText(/first name/i);
screen.getByRole('alert');

// Avoid unless necessary
screen.getByTestId('student-row-0');
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
jest.mock('@/modules/student-management/service/api', () => ({
  listStudents: jest.fn(),
  createStudent: jest.fn(),
}));

import { listStudents } from '@/modules/student-management/service/api';

beforeEach(() => {
  jest.mocked(listStudents).mockResolvedValue([mockStudentApiDto]);
});
```

## Reset mocks between tests

```ts
afterEach(() => {
  jest.clearAllMocks();
});
```

## Test structure

`describe` blocks group by behavior. Test names read as complete sentences.

```tsx
describe('StudentTable', () => {
  describe('when the list loads successfully', () => {
    it('renders a row for each student', async () => { ... });
    it('shows the student ID in each row', async () => { ... });
  });

  describe('when the API call fails', () => {
    it('shows an error toast', async () => { ... });
  });

  describe('when there are no students', () => {
    it('shows an empty state message', async () => { ... });
  });
});
```

## Custom hook tests

Every custom hook must cover three cases:

```ts
describe('useStudentDetail', () => {
  it('returns loading state initially', () => { ... });
  it('returns student data after successful fetch', async () => { ... });
  it('returns error message when fetch fails', async () => { ... });
});
```

Use `renderHook` from `@testing-library/react`:

```ts
import { renderHook, waitFor } from '@testing-library/react';

it('returns student data after successful fetch', async () => {
  const { result } = renderHook(() => useStudentDetail('student-123'));
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.data?.studentId).toBe('STU-001');
});
```

## Utility function tests

Cover edge cases: null input, empty arrays, boundary values, invalid input.

```ts
describe('apiDtoToStudent', () => {
  it('formats full name from first and last name', () => { ... });
  it('leaves address fields undefined when the API returns null', () => { ... });
  it('falls back to em dash when phone is undefined', () => { ... });
});
```

## What to test — not implementation details

Test what the user sees and does, not how the component is implemented internally.

```tsx
// Correct — tests user-observable behavior
it('shows a success message after adding a student', async () => {
  render(<AddEditStudentDialog open onOpenChange={jest.fn()} onSubmit={jest.fn()} />);
  await userEvent.type(screen.getByLabelText(/first name/i), 'John');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  expect(await screen.findByText(/added successfully/i)).toBeInTheDocument();
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
// Snapshot intentional: student table column order is contractual with the export tool
expect(container).toMatchSnapshot();
```

## Test utilities

Put shared test helpers and mock data in `src/__tests__/utils/` or co-located in module `__tests__/`:

```ts
// __tests__/mocks.ts
export const mockStudentApiDto: StudentApiDto = {
  id: 's-001',
  studentId: 'STU-001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '5551234567',
  course: 'React Fundamentals',
  status: 'active',
  assignedOn: '2026-01-15',
  createdAt: '2026-01-15T00:00:00.000Z',
  streetAddress: null,
  city: null,
  state: null,
  zipCode: null,
  country: null,
};
```
