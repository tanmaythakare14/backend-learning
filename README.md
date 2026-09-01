# My Monorepo

An Nx monorepo combining your existing React and Node boilerplates under a single workspace.

## What's Inside

| App / Lib | Source | Description |
|---|---|---|
| `apps/web` | React boilerplate | React 19 + Vite + Tailwind + Redux Toolkit + AES-encrypted storage + PHI logger |
| `apps/api` | Node boilerplate → NestJS | NestJS + Express middleware patterns + TypeORM + PostgreSQL + Winston |
| `libs/shared/types` | New | Shared TypeScript interfaces used by both apps |

## Stack

| Layer | Technology |
|---|---|
| Monorepo | Nx 21 |
| Package manager | Yarn |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4 |
| State management | Redux Toolkit + redux-persist (AES-encrypted) |
| Backend | NestJS 11 + Express middleware |
| ORM | TypeORM — SQL-first migration pattern |
| Database | PostgreSQL 17 |
| Validation | Joi (API) + class-validator (NestJS decorators) |
| Logging | Winston (API) + PHI-redacting logger (web) |
| Testing | Jest + React Testing Library |
| Linting | ESLint 9 (flat config) + Prettier |
| Commits | Husky + commitlint + commitizen (`yarn commit`) |
| CI | GitHub Actions — `nx affected` only |

## Project Structure

```
my-monorepo/
├── apps/
│   ├── web/                         # React app (port 3000)
│   │   └── src/
│   │       ├── app/                 # React components
│   │       ├── config/              # environment.ts
│   │       ├── store/               # Redux store + hooks (encrypted persist)
│   │       ├── utils/               # logger.ts, encryption.ts, secureStorage.ts
│   │       └── examples/            # usage-examples.ts
│   └── api/                         # NestJS app (port 4000)
│       ├── src/
│       │   ├── common/
│       │   │   ├── constants/       # HttpStatus, SuccessMessages, AuthErrorMessages
│       │   │   ├── exceptions/      # NotFoundException, ConflictException, etc.
│       │   │   ├── middleware/      # authenticate, authorize, validate, error-handler
│       │   │   └── utils/           # logger (Winston), loggerService, response.util, asyncHandler
│       │   ├── config/
│       │   │   └── data-source.ts   # TypeORM DataSource — SQL-first, synchronize: false
│       │   ├── domains/
│       │   │   ├── health-check/    # GET /health
│       │   │   └── example/         # Full CRUD domain (controller/service/repository/validator)
│       │   └── migrations/          # Raw SQL migrations only
│       └── test-utils/              # factories, mocks (express, typeorm, logger)
└── libs/
    └── shared/types/                # Shared TS interfaces
```

## Prerequisites

Check all three before you start:

```bash
node -v          # Node 20.x or 22.x+ (see "Node version" note below)
yarn -v          # should be 1.22+
pg_isready       # should print "accepting connections"
```

If `pg_isready` doesn't say "accepting connections," start your local PostgreSQL service before continuing — nothing past Step 3 will work without it.

**Node version:** This project's dependencies genuinely require Node **20.x or 22.x+** (`@nestjs/core` requires >=20; Vite requires ^18/^20/>=22, which excludes odd-numbered non-LTS releases like 21 or 23). `.nvmrc` pins `22` as the recommended version. There's no hard enforcement, so a mismatched version won't necessarily fail loudly — if something behaves strangely and your Node version is outside this range, that's the first thing to check.

## Getting Started & Local Setup

This guide takes you from a fresh clone to both servers running. Follow these steps in order.

### Step 1 — Install dependencies

```bash
yarn install
```

**Expect:** A `node_modules/` folder created at the repo root, `apps/api/`, and `apps/web/`. No errors. This can take a minute or two the first time.

### Step 2 — Create your env files

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/env.template apps/api/.env
```

**Expect:** Two new files, `apps/web/.env` and `apps/api/.env`, both git-ignored (they won't show up in `git status`).

### Step 3 — Create a local database

The app does **not** create its own database — you need one to already exist before running migrations.

```bash
createdb myapp_dev
# or: psql -c "CREATE DATABASE myapp_dev;"
```

Use any name you like — just make sure it matches `DB_DATABASE` in Step 4.

**Expect:** Running `psql -l` lists your new database.

### Step 4 — Edit `apps/api/.env`

Open `apps/api/.env` and change these values — the template ships with placeholders that will not work as-is. **The API will not start successfully until these are correct** — it doesn't fail fast on a bad DB connection, it hangs retrying indefinitely instead, so it's worth getting these right before starting the backend.

| Variable | Change to | Why |
|---|---|---|
| `DB_USERNAME` | Your local Postgres role (often `postgres`) | Must match a real Postgres user |
| `DB_PASSWORD` | Your local Postgres password | The template's placeholder (`postgres`) almost never matches your actual local setup |
| `DB_DATABASE` | The database name you created in Step 3 | Must match exactly |
| `JWT_SECRET` | Any random string | Required — the app will error if this is left as the placeholder or unset |

Leave everything else as-is unless you have a specific reason to change it (`DB_HOST`/`DB_PORT` only if Postgres isn't on `localhost:5432`; `ALLOWED_ORIGINS` only if the web app won't run on port 3000).

> `JWT_EXPIRES_IN` is present in the file but not used by any code yet — reserved for upcoming login/signup work, safe to ignore for now.

### Step 5 — Edit `apps/web/.env`

| Variable | Change to | Why |
|---|---|---|
| `VITE_ENCRYPTION_KEY` | Any random string | Actively used to AES-encrypt data in `localStorage`/`sessionStorage` and persisted Redux state — the template value is a placeholder |

Leave `VITE_API_URL`, `VITE_DISABLE_LOGGING`, and `VITE_DISABLE_PHI_REDACTION` as-is unless the API runs on a different port, or you have a specific reason to change logging behavior.

### Step 6 — Run migrations

```bash
cd apps/api
yarn migration:run
cd ../..
```

**Expect:** Output listing each migration name followed by "has been executed successfully." Afterward, `psql -d <your db> -c "\dt"` should show `role`, `example`, and `migrations` tables. You only need to do this once (or again later, whenever new migration files are added) — it's tracked, so re-running it is safe and just says nothing's pending.

### Step 7 — Start both servers

You have two options, depending on how you like to work:

#### Option A — One script, one terminal (recommended for most people)

```bash
./scripts/start-dev.sh
```

*(If you get a "permission denied," run `chmod +x scripts/start-dev.sh` once, then retry.)*

This installs dependencies again (harmless, quick if already installed) and starts both dev servers — through Nx, for both the API and the Web app — in one terminal, with output prefixed so you can tell them apart:

```
[API] Server started successfully
[WEB] VITE ready in 320 ms
```

Press `Ctrl+C` once to stop both servers together.

#### Option B — Two terminals, run each yourself

If you'd rather keep the two servers' output fully separate (e.g. in separate terminal panes), skip the script and run these in two different terminals instead:

```bash
# Terminal 1
yarn start:api

# Terminal 2
yarn start:web
```

Both are the same underlying Nx commands the script runs — just not combined into one stream. Stop each with `Ctrl+C` independently.

### What to expect once both are running

- **The API takes a while to become reachable on first boot** — usually around 8–10 seconds. It has to compile via webpack, boot Nest, and connect to Postgres before it starts listening. Don't assume it's stuck if `curl`/your browser can't reach it in the first few seconds; give it a moment.
- `http://localhost:4000/docs` shows the Swagger UI once the API is up — this is the fastest way to confirm the backend is actually serving requests.
- `http://localhost:3000` loads the web app in your browser (Vite comes up much faster than the API, usually well under a second).
- **`http://localhost:4000/health` currently does not work as you'd expect** — see "Known issues" below before you go looking for a bug in your own setup.

---

## Commands

```bash
# Development
yarn start:web            # Vite dev server
yarn start:api            # NestJS dev server (watch mode)

# Build
yarn build:all            # Build all projects
yarn affected:build       # Build only affected projects

# Test
yarn test:all             # Test all projects
yarn affected:test        # Test only affected (used in CI)

# Lint & Format
yarn lint:all             # Lint all
yarn format               # Prettier write
yarn format:check         # Prettier check (used in CI)

# Commits (interactive)
yarn commit               # Commitizen prompt (type + scope enforced)
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Health check |
| GET | `/api/v1/example` | Bearer JWT | List all examples |
| GET | `/api/v1/example/:id` | Bearer JWT | Get example by ID |
| POST | `/api/v1/example` | Bearer JWT | Create example |
| PUT | `/api/v1/example/:id` | Bearer JWT | Update example |
| DELETE | `/api/v1/example/:id` | None | Delete example |

## Adding a New Domain

```bash
# 1. Create the NestJS module
npx nx g @nx/nest:module --name=users --directory=apps/api/src/domains/users

# 2. Follow the example domain structure:
#    controller/ service/ repository/ entities/ dto/ validator/

# 3. Create a raw SQL migration
cd apps/api && yarn migration:create -- src/migrations/CreateUsersTable

# 4. Register the module in app.module.ts
```

## Key Conventions (from original repos)

### API
- **SQL-first migrations** — `synchronize: false` always. Write raw SQL, never `migration:generate`.
- **Domain structure** — each domain has its own controller / service / repository / dto / validator.
- **Error handling** — throw typed exceptions (`NotFoundException`, `ConflictException`) — the global error handler catches them.
- **Validation** — Joi schemas in `validator/` — passed to `validate()` middleware on routes.
- **Auth** — `authenticate` middleware verifies Bearer JWT → `req.user`. `requireRole()` for RBAC.

### Web
- **Secure storage** — always use `secureLocalStorage` / `secureSessionStorage` (AES-encrypted). Never raw `localStorage`.
- **Redux** — state is automatically encrypted and persisted via the secure storage adapter.
- **PHI logger** — import `logger` from `utils/logger`. PHI fields are always redacted.
- **Commits** — use `yarn commit` for the interactive Commitizen prompt. Format: `type(scope): subject`.

## Commit Format

```
type(scope): subject

Body (optional)

Refs JIRA-123
```

Types: `feat` `fix` `docs` `style` `refactor` `test` `chore`
Scopes: `web` `api` `shared` `auth` `ui` `tests` `build` `config` `ci`

## Module Boundaries (ESLint enforced)

| Tag | Can import from |
|---|---|
| `scope:web` | `scope:shared` only |
| `scope:api` | `scope:shared` only |
| `scope:shared` | `scope:shared` only |

---

## Known Issues (Pre-existing)

- **`/health` and `/api/v1/example` don't resolve to the paths their names suggest.** Both `HealthCheckController` and `ExampleController` are declared with an empty `@Controller()` (no path segment), so their routes actually collide at the bare `/api/v1` path instead of `/health` and `/api/v1/example` respectively. If you hit either documented path and get a 404, this is why — it's not something you did wrong.
- **The frontend doesn't call the backend anywhere yet.** They run side-by-side but are fully disconnected today — don't expect UI actions to hit the API.

See `CLAUDE.md` for more architectural notes if you're extending this codebase.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module 'ts-node'` when running migrations | Dependencies not installed yet | Run `yarn install` (Step 1) before Step 6 |
| `password authentication failed for user "..."` | `DB_PASSWORD` in `apps/api/.env` doesn't match your local Postgres | Fix `DB_PASSWORD` in Step 4 |
| `database "..." does not exist` | `DB_DATABASE` doesn't match a database you actually created | Re-check Step 3 and Step 4 match exactly |
| `ECONNREFUSED` connecting to the database | PostgreSQL isn't running | Start Postgres, confirm with `pg_isready` |
| API just sits there, never logs "Server started successfully" | Almost always a bad DB connection — it retries silently rather than crashing | Double-check Step 4's values match your actual Postgres instance |
| `permission denied to create extension "uuid-ossp"` | Your Postgres user lacks privileges to create extensions | Use a superuser role locally, or ask whoever manages your Postgres instance to grant it |
| `JWT_SECRET environment variable is not set` | `JWT_SECRET` still empty or missing in `apps/api/.env` | Set it per Step 4 |
| `EADDRINUSE` on port 3000 or 4000 | A previous run is still using the port | Find and stop the old process, or fully exit the previous run with `Ctrl+C` |
| `Starting inspector on localhost:9229 failed: address already in use` | A leftover Node debug-inspector process from a previous run is still alive | Harmless if the app still boots — the app port (4000) is separate from the debugger port (9229). If it bothers you, find and kill the stale process. |
