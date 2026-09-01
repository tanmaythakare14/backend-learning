# Backend AI — Design System & Handoff Spec

> **Status: template, not yet built.** No visual brand has been chosen and no UI beyond the `apps/web` demo/showcase page exists yet. This file defines the *target* architecture and conventions (several already locked in via `.claude/rules/*`) so that whoever builds the first real screen doesn't have to reinvent them. Every `[TBD]` is a real open decision — fill it in and delete the bracket once decided, don't invent a value here.

---

## 0. Repo context

This lives in the `backend-learning` Nx monorepo: `apps/web` (React 19 + Vite) and `apps/api` (NestJS 11). See the root `CLAUDE.md` for the authoritative description of what's real today.

| Branch | Role |
| --- | --- |
| `main` | Only branch that currently exists. |

The original CarMan-style template this doc is adapted from used a three-branch design workflow (frozen visual reference → active design branch → reviewed integration branch). **That workflow has not been adopted here.** If/when a dedicated design workstream starts, decide branch names then — don't assume `Design`/`development`/`design/themes` exist or should be recreated verbatim.

### What is already real (inherited via `.claude/rules/*`, not invented for this doc)

These rule files are checked into this repo and already govern any frontend code you write, even though no code following them exists yet:

- `rules/components.md` — shadcn/ui is the **only** UI library.
- `rules/dialog.md` — dialogs use `@base-ui/react/dialog`, **not Radix** (different prop surface — see §5).
- `rules/modules.md` — every feature lives in `src/modules/<feature>/` with a fixed sub-structure.
- `rules/api.md` — all HTTP calls go through `service/api.ts`; DTO↔UI transforms go through `mapper.ts`.
- `rules/state.md` — Redux Toolkit is for `authSlice`/`uiSlice` only; server data is local/component state.
- `rules/styling.md` — Tailwind utilities + semantic tokens only, no inline `style={}`, no hardcoded hex except universal status colors (§11) and the `data-phi` convention (§13).
- `rules/typescript.md` — no `any`, explicit return types on exported functions, Zod as the source of truth for form types.
- `rules/testing.md` — states **Vitest** + `@testing-library/react`.
- `rules/onboarding-patterns.md` — two-panel layout pattern for auth/onboarding screens.

**Known inconsistency — flag before relying on either side:** `rules/testing.md` prescribes Vitest, but `CLAUDE.md` and `apps/web/package.json` show the real setup is **Jest** (`jest-environment-jsdom`, `identity-obj-proxy`, and `npx jest ...` in the documented commands — no `vitest` package installed). Reconcile this before writing the first real test; don't silently pick one.

---

## 1. Locked decisions — do not invent around these

| Decision | Value | Notes |
| --- | --- | --- |
| Product name | **Backend AI** | Use exactly this, consistently. |
| UI library | **shadcn/ui only** | No MUI/Chakra/Ant/Mantine. Never hand-roll a primitive shadcn already provides. Not yet installed in `apps/web` — see §5. |
| Dialog primitive | `@base-ui/react/dialog` | Not Radix. See `rules/dialog.md` for the prop differences (`showCloseButton` instead of `hideCloseButton`; no `dismissible`/`onPointerDownOutside`/`onEscapeKeyDown`). |
| Module structure | `src/modules/<feature>/` | Fixed sub-folders (`@types`, `components`, `service`, `constants`, `utils`, `__tests__`). See `rules/modules.md`. |
| API layer | All `fetch` calls in `service/api.ts` | Never in a component, hook, or thunk. See `rules/api.md`. |
| State management | Redux Toolkit for `authSlice`/`uiSlice` only | Server/API data stays out of Redux — component-local state instead. See `rules/state.md`. |
| Styling | Tailwind utilities + semantic tokens | No inline `style={}`, no arbitrary hex in components. See `rules/styling.md`. |
| TypeScript | No `any`; explicit return types on exported functions; Zod is the source of truth for form types | See `rules/typescript.md`. Note: current `eslint.config.js` only `warn`s on `no-explicit-any` and has `explicit-function-return-type` turned **off** — the rule is aspirational until ESLint is tightened to match. |
| Sensitive-data marking | `data-phi` attribute + logger redaction + encrypted persistence | Already partially real: `apps/web/src/utils/{encryption,secureStorage,logger}.ts` exist and `store/index.ts` wires `redux-persist` through `secureStorage`. See §13. Keep this only if Backend AI actually handles PHI or similarly regulated data — drop it otherwise. |
| Product/brand name capitalization | `[TBD]` | Confirm exact casing (e.g. "Backend AI" vs "BackendAI") before it appears in a wordmark. |
| Logo mark | `[TBD]` | Not designed yet. |
| Primary color | `[TBD]` | |
| Canvas / surround color | `[TBD]` | |
| Accent color | `[TBD]` | |
| Heading font | `[TBD]` | `index.html` currently loads no custom fonts at all. |
| Body / UI font | `[TBD]` | |
| Type rule (serif/italic policy) | `[TBD]` | |
| Destructive-action color | `[TBD]` | Pick one universal red and use it everywhere (sign out, delete, disconnect) once chosen — don't let it vary by screen. |

---

## 2. Surface & layout pattern — `[TBD, proposal below]`

No layout has been decided or built. A reasonable starting proposal, if a sidebar-shell pattern is wanted, is a cream/neutral chrome (sidebar + top header) with white content cards — but this is a proposal, not a decision. Replace this section once an `AppShell`/`AppTopBar` actually exists.

```
┌──────────────────────────────────────────────┐
│ sidebar        │  top header                  │
│                ├───────────────────────────────┤
│  nav items     │  sticky page bars             │
│                │  ┌────────────┐ ┌───────────┐ │
│  (active nav   │  │ card       │ │ card      │ │
│   style: TBD)  │  └────────────┘ └───────────┘ │
└──────────────────────────────────────────────┘
```

Nothing here (`AppShell.tsx`, `AppTopBar.tsx`, sidebar collapse behavior, card radius) exists in `apps/web` today — this is greenfield.

---

## 3. Design tokens — `[TBD]`

No `@theme` block exists yet in `apps/web/src/index.css` (Tailwind v4 is present via `@import 'tailwindcss';`, but no custom tokens are defined). Once colors/fonts are decided, define them there and mirror the table below for review — don't let the two drift.

| Token | Hex | Use |
| --- | --- | --- |
| `--color-canvas` | `[TBD]` | Page background |
| `--color-card` | `[TBD]` | Card surfaces |
| `--color-primary` | `[TBD]` | Primary actions, active nav |
| `--color-accent` | `[TBD]` | Accent/secondary emphasis |
| `--color-foreground` | `[TBD]` | Primary text |
| `--color-muted-foreground` | `[TBD]` | Secondary/placeholder text |
| `--color-border` | `[TBD]` | Borders, inputs |
| `--color-success` / `--color-warning` / `--color-danger` | `[TBD]` | See §11 — pick these alongside the universal status colors, not independently |
| `--radius` | `[TBD]` | Card/input corner radius |

shadcn's semantic mapping (`--background`, `--foreground`, `--card`, `--primary`, `--secondary`/`--muted`, `--accent`, `--destructive`, `--border`/`--input`, `--ring`) should be derived from the tokens above once they exist — don't define shadcn variables independently.

---

## 4. Typography — `[TBD]`

`apps/web/index.html` currently loads no web fonts. Decide heading/body fonts and add the `<link>` there, then record the choice here (font names, weight axes, and whether headings get a distinct `.font-display` class as in the CarMan-style template this doc is adapted from).

---

## 5. shadcn/ui primitives — none installed yet

`apps/web` has no `src/components/ui/` directory and no `src/lib/utils.ts` (`cn()` helper) today. When shadcn is added:

- Install via `npx shadcn@latest add <component>` — **never** hand-write these files, and **never** re-run the CLI over an existing customized primitive (it silently overwrites custom variants).
- The rule files already assume a working set including: `button`, `input`, `form`, `dialog`, `table`, `badge`, `select`, `checkbox`, `calendar`, `textarea`, `tooltip`, `popover`, `separator`, `dropdown-menu`, `sonner` (toast), and a `sheet` for context panels. Install these first.
- `dialog.tsx` needs the project's custom `showCloseButton?: boolean` prop (default `true`) per `rules/dialog.md` — it wraps `@base-ui/react/dialog`, not Radix, so don't copy Radix-based shadcn dialog code verbatim.
- `badge.tsx` will need custom status variants once §11's colors are decided — plan for that customization before treating it as a stock primitive.

---

## 6. Common component library (planned) — `src/components/common/`

Not built yet. When building it, group by purpose the way the module rules expect — e.g. form-input wrappers (`FormInput`, `FormSelect`, date pickers), upload fields, layout pieces (`PageHeader`, tab bars), feedback/overlays (`ConfirmDialog`, success modals, dismissible banners), and table utilities (`SearchInput`, `FilterSelect`, pagination). Only add a wrapper here once two or more modules actually need it — don't pre-build a shared library speculatively (see `CLAUDE.md`'s general "don't build for hypothetical future requirements" guidance).

---

## 7. Layouts (planned) — `src/components/layouts/`

Not built yet. `AppShell` (sidebar + top bar + `<main>` slot) and `AppTopBar` would live here once §2 is decided.

---

## 8. Modules (planned) — `src/modules/`

None exist yet. `apps/api/src/domains/example/` is the only real reference structure in the repo today (generic CRUD: `name`, `col1`, `col2`, `col3`) — mirror its shape for the frontend's first `src/modules/<feature>/` per `rules/modules.md`, rather than inventing a new structure.

---

## 9. Screens (planned) — `src/screens/`

None exist yet. `apps/web`'s only current screen is the `App.tsx` showcase/demo page described in `CLAUDE.md` (Tailwind test grid, local counter, Redux counter, secure-storage demo, PHI-logger demo) — not real product UI, and there is no router installed (`react-router-dom` is not a dependency of `apps/web` today).

---

## 10. UI patterns established

None yet. Document reusable patterns here as they emerge (e.g. a section-header convention, a tooltip/popover panel pattern, a read-only context provider for a detail view) — don't pre-populate this with patterns from another project's domain.

---

## 11. Status / data-layer colors — `[TBD, but keep them universal once chosen]`

Convention to keep regardless of brand: status colors (active/success, pending/warning, new/info, inactive/muted, critical/danger) should be **hardcoded in `badge.tsx`** and **not** shift with theme — they're a clinical/operational convention, not a decorative one, once this app has any status semantics that matter operationally.

| Meaning | Variant | Background | Text | Dot |
| --- | --- | --- | --- | --- |
| Active / success | `success` | `[TBD]` | `[TBD]` | `[TBD]` |
| Pending / follow-up | `warning` | `[TBD]` | `[TBD]` | `[TBD]` |
| New / info | `info` | `[TBD]` | `[TBD]` | `[TBD]` |
| Inactive / on hold | `muted` | `[TBD]` | `[TBD]` | `[TBD]` |
| Critical | `danger` | `[TBD]` | `[TBD]` | — |

If Backend AI has a safety-critical severity signal (the way CarMan's allergy-severity red was never allowed to be themed), call that out explicitly here once it exists — don't let it get merged into a generic "danger" variant.

---

## 12. Logo & brand mark — `[TBD]`

Not designed. Once it exists, record here whether the mark is hardcoded/theme-independent (as is common for brand marks) and what the wordmark capitalization is (see §1).

---

## 13. Sensitive data handling

This is already partially real, not aspirational — keep it if Backend AI handles PHI or comparable regulated data; remove this section if it doesn't apply:

- `data-phi` attribute on every element rendering sensitive identifiers, per `rules/styling.md`.
- Never `console.log` sensitive fields — use `apps/web/src/utils/logger.ts`, which already redacts PHI-shaped fields, per `rules/api.md`.
- Never put sensitive data in Redux, not even in a non-persisted slice, per `rules/state.md`. `apps/web/src/store/index.ts` already wires `redux-persist` through `apps/web/src/utils/secureStorage.ts` (AES via `crypto-js`) for whatever *is* persisted.
- Env access only through `src/config/environment.ts` (per `CLAUDE.md`) — note `VITE_ENCRYPTION_KEY` has an insecure hardcoded fallback that must be overridden outside local dev.

---

## 14. Dependencies

### Actually installed today (`apps/web/package.json`)

`@reduxjs/toolkit`, `react-redux`, `redux-persist`, `crypto-js`, `react`/`react-dom` 19, Tailwind v4 (`@tailwindcss/postcss`), Vite, plus Jest-oriented test tooling (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jest-environment-jsdom`, `identity-obj-proxy`).

### Required by the rule files but not yet installed

Before the `.claude/rules/*` conventions are actually followable, these need to be added: `shadcn/ui` (+ `class-variance-authority`, `clsx`, `tailwind-merge`), `@base-ui/react`, `react-hook-form`, `@hookform/resolvers`, `zod`, `@tanstack/react-table`, `sonner`, `date-fns`, `react-router-dom`, `lucide-react`. Don't assume any of these exist until you check `apps/web/package.json` again — this list will go stale the moment the first is added.

---

## 15. Tooling conventions (real, verified)

### Commits

`yarn commit` runs `cz-customizable` (config: `.cz.config.cjs`) with types `feat`/`fix`/`docs`/`style`/`refactor`/`test`/`chore` and a curated scope list (`web`, `api`, `shared`, `auth`, `ui`, `tests`, `build`, `config`, `ci` — custom scopes also allowed). `commitlint.config.js` enforces non-empty `type`/`scope`/`subject` and restricts `type` to the same seven values.

### ESLint (`eslint.config.js`)

Flat config, `typescript-eslint` recommended + `eslint-config-prettier`. Currently softer than `rules/typescript.md` implies: `@typescript-eslint/no-explicit-any` is `warn` (not error) and `@typescript-eslint/explicit-function-return-type` is explicitly `off`. Tighten these if the rule docs' "no any" / "explicit return types" requirements need to be enforced rather than just documented.

### Husky

`.husky/` exists with a `pre-commit` hook running `lint-staged` (`eslint --fix` + `prettier --write` on `*.{ts,tsx}`, from root `package.json`).

---

## 16. Working rules for the AI

1. **Read before you write.** Open `apps/web/src/index.css`, whatever exists in `src/components/ui/`, and the relevant `.claude/rules/*.md` file for the layer you're touching.
2. **Never hardcode a hex** in a component once §3/§11 are decided. Use the semantic token.
3. **Never regenerate shadcn primitives** with the CLI once one has been customized — copy the customized file instead.
4. **Follow `rules/components.md` and `rules/dialog.md` exactly** for prop naming — this project's dialog API differs from stock shadcn/Radix examples found online.
5. Don't invent product-specific screens, modules, or brand facts to fill gaps in this document — leave `[TBD]` and ask, the way §1's color/font rows are left open rather than guessed.
6. When a rule file and the real codebase disagree (see the Jest/Vitest note in §0, or the ESLint gap in §15), **surface the discrepancy** rather than silently picking a side.
7. Once real screens exist, replace §§6–10's "planned/none yet" placeholders with the actual built inventory — keep this file live, not frozen.
