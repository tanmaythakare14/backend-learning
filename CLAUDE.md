# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Nx monorepo combining a React frontend and a NestJS backend under one workspace: `apps/web` (React 19 + Vite) and `apps/api` (NestJS 11, built on top of Express middleware patterns carried over from an earlier plain-Node/Express repo). `libs/shared/types` holds TypeScript interfaces meant to be shared between both apps, but **nothing currently imports from it** — treat it as aspirational, not load-bearing.

First-time setup (env files, DB creation, migrations, running both servers) is fully documented in `RUNNING.md` — read that before trying to run anything locally.

## Commands

```bash
# Install (Yarn workspaces — root install covers apps/api and apps/web both)
yarn install

# Run both dev servers together (installs deps, then runs both through Nx)
./scripts/start-dev.sh

# Or run individually, in separate terminals
yarn start:api     # nx serve api  → http://localhost:4000/api/v1, Swagger at /docs
yarn start:web     # nx serve web  → http://localhost:3000

# Build / test / lint everything
yarn build:all
yarn test:all
yarn lint:all

# Same, but only for projects affected by your current diff (what CI runs)
yarn affected:build
yarn affected:test
yarn affected:lint

# Format
yarn format          # write
yarn format:check    # check only (CI)

# Single test file
cd apps/api && npx jest src/domains/example/service/example.service.test.ts
cd apps/web && npx jest src/app/App.spec.tsx
# or via Nx, forwarding a pattern to the underlying jest run:
npx nx test api -- --testPathPattern=example.service

# Migrations (apps/api) — see "SQL-first migrations" below before touching these
cd apps/api
yarn migration:run
yarn migration:revert
yarn migration:show
yarn migration:create -- src/migrations/YourMigrationName   # writes an empty migration; fill in raw SQL by hand

# Commits — interactive, enforces type(scope): subject
yarn commit
```

## Architecture

### Backend (`apps/api`) — Express conventions layered under NestJS

This app is a NestJS port of an older plain Express/Node service, and it deliberately keeps that service's conventions instead of going full-Nest-idiomatic in several places:

- **Error handling happens at the raw Express layer, not via Nest's exception filters.** `main.ts` drops down to `app.getHttpAdapter().getInstance()` after Nest wires its router, and attaches classic Express `errorHandler`/`notFoundHandler` middleware (`common/middleware/error-handler.middleware.ts`) directly. Custom exceptions in `common/exceptions/` (`NotFoundException`, `ConflictException`, etc.) are plain `Error` subclasses with a `statusCode` field, not `HttpException` subclasses — they're designed to be caught by that Express-level handler, not Nest's filter pipeline. Follow this pattern for new domains; don't introduce Nest `ExceptionFilter`s expecting them to be consistent with existing error handling.
- **Domain structure**: each domain under `src/domains/<name>/` has its own `controller/`, `service/`, `repository/`, `entities/`, `dto/`, and (where applicable) `validator/`. `domains/example/` is the reference template to copy for new domains — it's a generic CRUD domain (fields are literally `name`, `col1`, `col2`, `col3`), not a real feature.
- **Auth middleware exists but isn't wired up.** `common/middleware/authenticate.middleware.ts` (Bearer JWT → `req.user`) and `authorize.middleware.ts` (`requireRole()`/`requireAllRoles()`) are fully implemented but not applied to any route or module today — despite Swagger annotations (`@ApiBearerAuth()`) and the README implying the `example` domain requires auth. Don't assume a route is protected just because it's annotated.
- **Validation via Joi, not wired for `example`.** `validator/` files use Joi schemas meant to be passed to the standalone `validate()`/`validateLogin()` middleware (`common/middleware/validate.middleware.ts`), but `ExampleController` doesn't actually call `validate()` on its routes — it relies only on Nest's implicit body binding. If you add Joi-based validation to a new domain, wire the middleware explicitly; it isn't automatic.
- **Two distinct "audit" mechanisms, easy to confuse**: `AuditMiddleware` (`common/middleware/audit.middleware.ts`) logs one structured entry per HTTP request, applied globally in `app.module.ts`. `AuditLogger` (`common/utils/audit-logger.service.ts`) is a separate, manually-invoked service used _inside_ business logic (e.g. `ExampleService` calls `this.audit.log(...)` at specific points). They serve different purposes despite the shared name.

### SQL-first migrations — the one hard rule in this codebase

`apps/api/src/config/data-source.ts` sets `synchronize: false` unconditionally and comments describe this as sacred: **never** set it to `true`, **never** use `migration:generate` (it's explicitly disabled in `package.json` — `migration:generate:DISABLED` just errors out), and **never** rely on entity decorators to define schema. Every schema change is a hand-written raw SQL migration under `src/migrations/`. If you add a new domain/entity, you must also hand-write its migration.

`AppDataSource` in `data-source.ts` is the single source of truth for DB connection config, consumed both by the NestJS `TypeOrmModule` (via `app.module.ts`) and the TypeORM CLI (migrations) — this keeps app runtime and migration tooling using identical connection settings. There's also an unused, dead-code duplicate of this wiring in `config/database.module.ts` — never imported, safe to ignore or remove.

### Known pre-existing bugs (not fixed, worth knowing before you go looking for a route)

- **`HealthCheckController` and `ExampleController` both use bare `@Controller()`** (no path segment) combined with argument-less `@Get()` handlers. Combined with the global prefix (`app.setGlobalPrefix('api/v1', { exclude: ['health'] })` in `main.ts`), routes don't land where the README/Swagger imply — the exclude never matches (there's no literal `'health'` path to exclude), and both controllers' root GET handlers collide at `/api/v1` rather than `/health` and `/api/v1/example` respectively. If a route 404s where you expect it to exist, check the controller's actual computed path before assuming something else is broken.
- `apps/web/tailwind.config.js` is currently unused — Tailwind v4 (via `@import 'tailwindcss';` in `index.css`) uses automatic content detection, not the legacy JS config file. Don't assume editing `tailwind.config.js` has any effect.

### `apps/api/webpack.config.js` — must stay a function, not a plain object

This is non-obvious and easy to regress: the file **must** export a function `(config, { options }) => {...}`, not a plain object, and must set `config.watch = options.watch` before returning. If it's a plain object, Nx's webpack executor never learns whether it's being invoked for `nx serve` (watch mode) vs `nx build` (one-shot) — `nx serve api` will silently perform a single one-shot build instead of entering real watch mode, and `@nx/js:node`'s serve wrapper will then busy-loop killing and relaunching the process roughly once a second, forever, because it treats the build's already-exhausted output stream as an endless sequence of "rebuild happened" events. The app never finishes booting when this regresses — it looks like a hang, not a crash, and produces no useful error message. If `nx serve api` stops working after touching this file, check this first.

### Frontend (`apps/web`)

- `App.tsx` is a showcase/demo page (Tailwind test grid, local `useState` counter, Redux counter, secure-storage demo, PHI-logger demo) — not real product UI. No router is installed (no `react-router-dom` or equivalent) and there is exactly one page.
- **The frontend does not call the backend anywhere.** `config/environment.ts` defines `apiUrl`, and Vite's dev server proxies `/api` → `http://localhost:4000`, but no `fetch`/`axios` call exists anywhere in `src/`. Treat FE and BE as fully disconnected today.
- **Security-focused utilities are the reusable part of this app**: `utils/encryption.ts` (AES via `crypto-js`), `utils/secureStorage.ts` (encrypted wrappers around `localStorage`/`sessionStorage`), and `utils/logger.ts` (a PHI-redacting logger — regex- and field-name-based redaction, on by default, HIPAA-oriented). `store/index.ts` wires `redux-persist` through the secure storage adapter, so persisted Redux state is transparently AES-encrypted. `VITE_ENCRYPTION_KEY` has an insecure hardcoded fallback if unset — must be overridden for anything beyond local dev.

### Module boundaries (ESLint-enforced)

`scope:web` and `scope:api` may only import from `scope:shared`; `scope:shared` may only import from itself. Don't introduce direct imports between `apps/web` and `apps/api`.

### Dependency reproducibility

`yarn.lock` was, for a long time, committed empty — meaning fresh installs at different points in time could resolve entirely different dependency versions, which is exactly how several hard-to-diagnose bugs in this codebase were introduced (a TypeORM deep-import path that broke under a resolved 0.3.30 vs 0.3.20, an `@nx/webpack` version whose empty-webpack-config fallback behavior differs across releases). If dependency-version-sensitive bugs show up, check whether they reproduce against the currently committed `yarn.lock` before assuming the surrounding code is wrong.

Node 20.x or 22.x+ is the realistic supported range (`@nestjs/core` requires >=20, Vite requires ^18/^20/>=22) — `.nvmrc` pins 22 as the recommended version, but there's no `engines` field enforcing it.
