# State Management Rules

## Auth is Auth0, not a Redux slice

This project authenticates via `@auth0/auth0-react` (`ProtectedRoute`, `AuthTokenBridge`), not a hand-rolled `authSlice`/login-thunk pattern. There is currently no `authSlice.ts` anywhere in the codebase — don't add one. The session/user comes from Auth0's `useAuth0()` hook directly in components (e.g. `AuthenticatedShell` in `App.tsx` reads `user` that way), and the access token for API calls is threaded through `src/utils/authToken.ts` (`setAccessTokenGetter`/`getAccessToken`), populated once by `AuthTokenBridge`, and consumed by `src/utils/httpHeaders.ts`'s `authHeaders()` — see [api.md](api.md). Service functions are plain functions, not hooks, so they read the token through that module-level getter instead of calling `useAuth0()` themselves.

## Redux Toolkit is for global UI state only

`src/store/index.ts` currently only has a placeholder `sampleReducer` — replace it with real slices as they're needed, following this shape:

| Slice     | What goes here                                            |
| --------- | ---------------------------------------------------------- |
| `uiSlice` | Sidebar open/close, active modal, global loading overlay  |

**Server/API data (student list, course records) does NOT go in Redux.** Use component-local state + the service layer directly. If the data needs to be shared between sibling components, lift state to the nearest common parent or use a module-level context.

## Slice file location and naming

```
src/store/slices/
└── uiSlice.ts
```

One file per domain. Name the file `<domain>Slice.ts`.

## Slice pattern

Every slice must have an explicit interface for its state shape:

```ts
// src/store/slices/uiSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setActiveModal(state, action: PayloadAction<string | null>) {
      state.activeModal = action.payload;
    },
  },
});

export const { setSidebarOpen, setActiveModal } = uiSlice.actions;
export default uiSlice.reducer;
```

Wire it into `src/store/index.ts`'s `combineReducers` call alongside (or in place of) the placeholder `sampleReducer`.

## Async thunks via `createAsyncThunk`

If a slice ever needs an async action (rare, since server data stays out of Redux), it must use `createAsyncThunk` and delegate to the service layer — never call `fetch` directly:

```ts
// Correct — thunk delegates to service layer
export const someThunk = createAsyncThunk('ui/something', async (arg: SomeArg, { rejectWithValue }) => {
  try {
    return await someApi.doSomething(arg); // service call
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Request failed');
  }
});

// Wrong — fetch in a thunk
export const someThunk = createAsyncThunk('ui/something', async (arg) => {
  const res = await fetch('/api/v1/something', { method: 'POST', body: JSON.stringify(arg) });
  return res.json();
});
```

## Always use typed hooks

Never use raw `useDispatch` or `useSelector`. Always use the typed wrappers from `src/store/hooks.ts` (this is the actual existing file — match its style):

```ts
// src/store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```ts
// In any component or hook
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const dispatch = useAppDispatch();
const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
```

## Encrypted persistence for sensitive state

The Redux store is already configured with `redux-persist` + `secureStorage` in `src/store/index.ts`. Never change the persistence configuration. Never add student PII (email, phone, address) to Redux state — not even to a non-persisted slice; server data doesn't belong in Redux at all (see above).

```ts
// Wrong — server/PII data in Redux
const studentSlice = createSlice({
  name: 'student',
  initialState: { selectedStudentEmail: '', selectedStudentPhone: '' },
  ...
});

// Correct — only the ID in Redux (or nothing at all)
const uiSlice = createSlice({
  name: 'ui',
  initialState: { selectedStudentId: null as string | null },
  ...
});
```

## Selectors

Write selectors as plain functions — no need for `createSelector` unless the selector is expensive:

```ts
// src/store/slices/uiSlice.ts
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectActiveModal = (state: RootState) => state.ui.activeModal;
```

## No Redux for component-local UI state

Do not put things like form step index, accordion open state, dropdown visibility, or table sort order in Redux. These stay local to the component with `useState`.

```ts
// Wrong — in a Redux slice
showAddStudentDialog: boolean;
currentStep: number;
tableSortField: string;

// Correct — local component state
const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
const [currentStep, setCurrentStep] = useState(0);
```
