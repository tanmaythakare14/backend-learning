# Cognify — Frontend Guide

## Project Overview

Student-management platform frontend. Manages students, courses, and
real-time messaging between staff. Single audience/role — no multi-role
routing. Auth0 is the sole identity provider; this app never issues its own
credentials.

**Stack:** React 19 · TypeScript · Vite · shadcn/ui (hand-written primitives — no CLI available in this environment) · Tailwind CSS v4 · Redux Toolkit · React Router v7 · Auth0

---

## Commands

```bash
yarn start:web                                                # nx serve web → http://localhost:3000
yarn build:all                                                 # builds both apps
yarn affected:build / affected:test / affected:lint            # only projects touched by your diff
yarn format / yarn format:check                                 # prettier, whole workspace

cd apps/web && npx nx test web -- --testPathPattern=<name>      # single test file (see Testing note below — currently broken)
npx eslint src/<path>                                            # lint one file, no Nx overhead
npx tsc --noEmit -p apps/web/tsconfig.app.json                   # type-check only
npx prettier --write src/<path>                                  # format one file
```

---

## Tech Stack — Approved Libraries Only

| Purpose         | Library                                   | Notes                                                                       |
| --------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| Identity/Auth   | **Auth0** (`@auth0/auth0-react`)          | Sole identity provider — no custom login/register/reset screens             |
| UI components   | **shadcn/ui**                             | Only UI library; primitives hand-written under `components/ui/`             |
| Styling         | **Tailwind CSS v4**                       | Utility classes only; `tailwind.config.js` is dead (auto content detection) |
| Forms           | **React Hook Form + Zod**                 | Zod schema is the source of truth for the form's TS type                    |
| Data tables     | **shadcn/ui `<Table>`**                   | No table library installed — TanStack Table is NOT a dependency here        |
| Dialogs         | **@base-ui/react/dialog`+`alert-dialog`** | Not Radix — see `.claude/rules/dialog.md`                                   |
| Routing         | **React Router v7**                       | `BrowserRouter`, protected via `useAuth0()`, not a Redux slice              |
| State           | **Redux Toolkit**                         | Global UI state only — currently almost unused; no auth slice exists        |
| Icons           | **Lucide React**                          | Already used by shadcn/ui                                                   |
| Toasts          | **Sonner**                                | Via shadcn/ui `<Sonner>` component                                          |
| Class utilities | **clsx + tailwind-merge + cva**           | Required by shadcn/ui internals                                             |
| Real-time       | **socket.io-client**                      | Chat module only (`message/service/socket.ts`)                              |

Adding any library not in this table requires checking with the team first.

---

## Modules

All feature code lives inside `src/modules/`. Never add business logic to `src/` root or `src/components/`.

| Module               | Key screens/components                             | Description                                                                           |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `onboarding`         | `SignInScreen`                                     | Sole entry point — two buttons that hand off to Auth0's hosted pages                  |
| `student-management` | List, detail, add/edit dialog, course filter       | CRUD + soft-delete (active/deactivated/deleted) on students                           |
| `course-management`  | List, add/edit dialog, status tabs (incl. Deleted) | CRUD + soft-delete on courses; catalog consumed independently by `student-management` |
| `message`            | Conversation list, thread view                     | Real-time chat via REST + a Socket.io connection                                      |

---

## Source Layout

```
src/
├── modules/                    # All feature modules (see rules/modules.md)
│   ├── onboarding/
│   ├── student-management/
│   ├── course-management/
│   └── message/
├── components/
│   ├── ui/                     # shadcn/ui primitives — NEVER hand-edit for a one-off
│   ├── common/                 # ConfirmDialog, SearchInput, PhoneNumberField
│   ├── layouts/                # AppShell, AppSidebar, AppTopBar
│   ├── Auth0ProviderWithNavigate.tsx
│   ├── AuthTokenBridge.tsx
│   └── ProtectedRoute.tsx
├── store/
│   ├── index.ts                 # Redux store + secureStorage-encrypted persistence
│   ├── hooks.ts                 # useAppDispatch, useAppSelector
│   └── slices/                  # One slice per domain (currently minimal — no auth slice)
├── utils/
│   ├── authToken.ts              # Bridges Auth0's access token into plain service/api.ts files
│   ├── httpHeaders.ts             # authHeaders() — attach the bearer token to a fetch call
│   ├── apiError.ts                # handleHttpError() — single error-mapping point
│   ├── encryption.ts              # CryptoJS AES — do not modify
│   ├── secureStorage.ts
│   └── logger.ts                  # Redacting logger — always use this, never console.log
├── config/
│   └── environment.ts             # All Vite env var access (NEVER import.meta.env elsewhere)
└── main.tsx                       # Auth0Provider → Redux Provider → PersistGate → App
```

---

## Cross-Cutting Rules (enforced at all times)

- **Every module's `service/api.ts` must attach the Auth0 access token.** Use `authHeaders()` from `utils/httpHeaders.ts` — every protected backend route 401s without a valid token. A new module's API layer that forgets this fails silently via `handleHttpError`'s 401 branch (redirect to `/login`), not an obvious error.
- Never hardcode API base URLs — read from `config.apiUrl` in `src/config/environment.ts`.
- Never expose raw API error messages to the UI — `handleHttpError` already maps them to user-safe strings; don't bypass it.
- Never log sensitive/user-identifying data with `console.log` — use `src/utils/logger.ts`, which auto-redacts sensitive-looking field names/patterns.
- Redux-persisted state is AES-encrypted via the `secureStorage` adapter (`store/index.ts`) — never change that persistence config, and never put anything sensitive in a _non_-persisted slice either.
- Don't rebuild a custom login/register/forgot-password screen — see Auth Architecture below. If a task sounds like it wants one, it almost certainly means wiring into Auth0 instead.

---

## Path Aliases

Use `@/` for `src/` in all imports. Never use relative `../../` paths that cross module boundaries. (See `.claude/rules/typescript.md`.)

```ts
// correct
import { listStudents } from '@/modules/student-management/service/api';
import { Button } from '@/components/ui/button';

// wrong
import { listStudents } from '../../modules/student-management/service/api';
```

---

## Auth Architecture (Auth0)

There is no custom auth flow — Auth0 is the entire identity story. Read this
before touching anything auth-adjacent.

- `main.tsx` wraps the app in `Auth0ProviderWithNavigate` (`components/Auth0ProviderWithNavigate.tsx`), configured with `cacheLocation: 'localstorage'` + `useRefreshTokens: true` so sessions survive a reload. It must render **inside** `BrowserRouter` (uses `useNavigate` for the post-login redirect).
- Env vars: `VITE_AUTH0_DOMAIN` / `VITE_AUTH0_CLIENT_ID` / `VITE_AUTH0_AUDIENCE` → surfaced as `config.auth0Domain` / `auth0ClientId` / `auth0Audience`.
- `SignInScreen` offers "Continue to sign in" (`loginWithRedirect()`) and "Continue with Google" (`loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })`) — signup happens on Auth0's hosted page.
- `ProtectedRoute` gates routes on `useAuth0().isAuthenticated`/`isLoading`.
- `AppShell`'s logout confirmation calls `useAuth0().logout({ logoutParams: { returnTo: window.location.origin } })`.
- `AuthTokenBridge`, mounted once in `App.tsx`, (1) registers `getAccessTokenSilently` into `utils/authToken.ts` so non-component `service/api.ts` functions can reach it, and (2) on first authenticated render, calls `POST /api/v1/auth/sync` once to just-in-time-provision the user's row in Postgres from Auth0's profile.
- `.claude/rules/onboarding-patterns.md` documents password-strength meters, success popups, and demo banners built for the now-**deleted** create-account/forgot-password/reset-password screens — only its two-panel `OnboardingScreenLayout` is still live. Don't resurrect the rest without being asked.

---

## Path-Scoped Rules (auto-loaded by Claude Code)

- @rules/modules.md — folder structure, layer separation, barrel exports
- @rules/components.md — shadcn/ui usage, form patterns, table patterns
- @rules/dialog.md — `@base-ui/react/dialog`/`alert-dialog` (not Radix) usage and TypeScript gotchas
- @rules/api.md — HTTP client, response typing, error handling
- @rules/typescript.md — type safety, interfaces, Zod schema conventions, path aliases
- @rules/state.md — Redux Toolkit slice/thunk patterns (currently near-unused — no auth slice)
- @rules/styling.md — Tailwind utility rules, semantic token conventions
- @rules/onboarding-patterns.md — **largely historical** (now flagged as such in the file itself) — only the two-panel layout is still live
- @rules/testing.md — Jest via Nx (correctly documented) — but **`jest` is not installed in this workspace**, so `nx test web`/`npx jest` fail outright. Verify frontend changes with `tsc --noEmit` + `eslint` + manual/Playwright browser checks until this is fixed.
