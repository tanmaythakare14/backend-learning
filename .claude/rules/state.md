# State Management Rules

## Redux Toolkit is for auth and global UI state only

Redux manages two domains:

| Slice       | What goes here                                           |
| ----------- | -------------------------------------------------------- |
| `authSlice` | Authenticated user, token, session expiry, role          |
| `uiSlice`   | Sidebar open/close, active modal, global loading overlay |

**Server/API data (patient list, billing records, user list) does NOT go in Redux.** Use component-local state + the service layer directly. If the data needs to be shared between sibling components, lift state to the nearest common parent or use a module-level context.

## Slice file location and naming

```
src/store/slices/
├── authSlice.ts
└── uiSlice.ts
```

One file per domain. Name the file `<domain>Slice.ts`.

## Slice pattern

Every slice must have an explicit interface for its state shape:

```ts
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

interface AuthUser {
  id: string;
  email: string;
  role: 'CLINIC_ADMIN' | 'PHYSICIAN' | 'NURSE' | 'DHN';
  clinicId: string;
  fullName: string;
}

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
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
```

## Async thunks via `createAsyncThunk`

Every async Redux action must use `createAsyncThunk`. The thunk calls the service layer — never calls `fetch` directly:

```ts
// Correct — thunk delegates to service layer
export const loginThunk = createAsyncThunk('auth/login', async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    return await authApi.login(credentials); // service call
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
  }
});

// Wrong — fetch in a thunk
export const loginThunk = createAsyncThunk('auth/login', async (credentials) => {
  const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify(credentials) });
  return res.json();
});
```

## Always use typed hooks

Never use raw `useDispatch` or `useSelector`. Always use the typed wrappers from `src/store/hooks.ts`:

```ts
// src/store/hooks.ts
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```ts
// In any component or hook
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.auth.user);
```

## Encrypted persistence for sensitive state

The Redux store is already configured with `redux-persist` + `secureStorage` in `src/store/index.ts`. Never change the persistence configuration. Never add PHI (MRN, DOB, insurance) to Redux state — not even to a non-persisted slice.

```ts
// Wrong — PHI in Redux
const patientSlice = createSlice({
  name: 'patient',
  initialState: { selectedPatientMrn: '', selectedPatientDob: '' },
  ...
});

// Correct — only the ID in Redux (or nothing at all)
const uiSlice = createSlice({
  name: 'ui',
  initialState: { selectedPatientId: null as string | null },
  ...
});
```

## Selectors

Write selectors as plain functions — no need for `createSelector` unless the selector is expensive:

```ts
// src/store/slices/authSlice.ts
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectUserRole = (state: RootState) => state.auth.user?.role ?? null;
export const selectIsAuthenticated = (state: RootState) => state.auth.token !== null;
```

## No Redux for component-local UI state

Do not put things like form step index, accordion open state, dropdown visibility, or table sort order in Redux. These stay local to the component with `useState`.

```ts
// Wrong — in a Redux slice
showEnrollmentModal: boolean;
currentStep: number;
tableSortField: string;

// Correct — local component state
const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
const [currentStep, setCurrentStep] = useState(0);
```
