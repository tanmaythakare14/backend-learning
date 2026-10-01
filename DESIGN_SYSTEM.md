# Backend AI — Design System & Handoff Spec

> **Status: first real screen shipped.** The Create Account onboarding screen (`apps/web/src/modules/onboarding/`) is the first UI built against this doc, and it locked in real values for several rows below (colors, font, radius) — see §3/§4. Several other rows are still open. Every remaining `[TBD]` is a real open decision — fill it in and delete the bracket once decided, don't invent a value here.

---

## 0. Repo context

This lives in the `backend-learning` Nx monorepo: `apps/web` (React 19 + Vite) and `apps/api` (NestJS 11). See the root `CLAUDE.md` for the authoritative description of what's real today.

| Branch | Role                               |
| ------ | ---------------------------------- |
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

| Decision                          | Value                                                                                            | Notes                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product name                      | **Backend AI** (repo-level) — **but the Create Account screen ships as "Cognify"**               | **Open conflict, not resolved by this edit.** The onboarding screen was built for a user-facing "learning platform" and named "Cognify" at the user's explicit request; "Backend AI" was never confirmed as the consumer-facing brand for that product. Don't propagate either name further until this is settled — ask rather than guessing which one wins. |
| UI library                        | **shadcn/ui only**                                                                               | No MUI/Chakra/Ant/Mantine. Never hand-roll a primitive shadcn already provides. Not yet installed in `apps/web` — see §5.                                                                                                                                                                                                                                    |
| Dialog primitive                  | `@base-ui/react/dialog`                                                                          | Not Radix. See `rules/dialog.md` for the prop differences (`showCloseButton` instead of `hideCloseButton`; no `dismissible`/`onPointerDownOutside`/`onEscapeKeyDown`).                                                                                                                                                                                       |
| Module structure                  | `src/modules/<feature>/`                                                                         | Fixed sub-folders (`@types`, `components`, `service`, `constants`, `utils`, `__tests__`). See `rules/modules.md`.                                                                                                                                                                                                                                            |
| API layer                         | All `fetch` calls in `service/api.ts`                                                            | Never in a component, hook, or thunk. See `rules/api.md`.                                                                                                                                                                                                                                                                                                    |
| State management                  | Redux Toolkit for `authSlice`/`uiSlice` only                                                     | Server/API data stays out of Redux — component-local state instead. See `rules/state.md`.                                                                                                                                                                                                                                                                    |
| Styling                           | Tailwind utilities + semantic tokens                                                             | No inline `style={}`, no arbitrary hex in components. See `rules/styling.md`.                                                                                                                                                                                                                                                                                |
| TypeScript                        | No `any`; explicit return types on exported functions; Zod is the source of truth for form types | See `rules/typescript.md`. Note: current `eslint.config.js` only `warn`s on `no-explicit-any` and has `explicit-function-return-type` turned **off** — the rule is aspirational until ESLint is tightened to match.                                                                                                                                          |
| Sensitive-data marking            | `data-phi` attribute + logger redaction + encrypted persistence                                  | Already partially real: `apps/web/src/utils/{encryption,secureStorage,logger}.ts` exist and `store/index.ts` wires `redux-persist` through `secureStorage`. See §13. Keep this only if Backend AI actually handles PHI or similarly regulated data — drop it otherwise.                                                                                      |
| Product/brand name capitalization | `[TBD]`                                                                                          | Blocked on the Backend AI vs Cognify conflict above.                                                                                                                                                                                                                                                                                                         |
| Logo mark                         | `[TBD]`                                                                                          | Not designed. The Cognify screen uses a placeholder — a `lucide-react` `GraduationCap` icon in a rounded indigo-tint square — not a real mark. Don't treat it as final.                                                                                                                                                                                      |
| Primary color                     | `#6366F1`                                                                                        | Locked by the Cognify screen (`--color-primary` in `apps/web/src/index.css`). Hover state `#4F46E5` (`--color-primary-hover`).                                                                                                                                                                                                                               |
| Canvas / surround color           | `#fcfcff`                                                                                        | `--color-canvas`. Cards are pure white (`--color-card: #ffffff`).                                                                                                                                                                                                                                                                                            |
| Accent color                      | `#6366F1`                                                                                        | Same value as primary in this screen (`--color-accent`) — there's no distinct secondary accent yet.                                                                                                                                                                                                                                                          |
| Heading font                      | Inter                                                                                            | Loaded via Google Fonts `<link>` in `apps/web/index.html` (weights 400–800). Used for both headings and body — no separate display face.                                                                                                                                                                                                                     |
| Body / UI font                    | Inter                                                                                            | Same face as headings, mapped to `font-sans` via `--font-sans` in `index.css`.                                                                                                                                                                                                                                                                               |
| Type rule (serif/italic policy)   | Sans-only, no italic observed                                                                    | Not written as an explicit rule anywhere yet — just the pattern the one shipped screen follows. Confirm before treating as locked.                                                                                                                                                                                                                           |
| Destructive-action color          | `#dc2626`                                                                                        | `--color-destructive`, currently only used for form validation error text on the Cognify screen — not yet exercised on a real destructive action (delete/sign-out) anywhere.                                                                                                                                                                                 |

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

## 3. Design tokens — first real values landed, still incomplete

`apps/web/src/index.css` now has a real `@theme` block (Tailwind v4). Values below are live, taken directly from that file — but it only covers what the Cognify screen needed, so several rows other screens will need are still open.

| Token                                                                  | Hex                                                               | Use                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-canvas`                                                       | `#fcfcff`                                                         | Page background                                                                                                                                                                                                      |
| `--color-card`                                                         | `#ffffff`                                                         | Card surfaces                                                                                                                                                                                                        |
| `--color-primary` / `--color-primary-hover`                            | `#6366f1` / `#4f46e5`                                             | Primary actions, CTAs                                                                                                                                                                                                |
| `--color-accent` / `--color-accent-soft` / `--color-accent-foreground` | `#6366f1` / `#eef2ff` / `#4338ca`                                 | Accent emphasis, soft tinted backgrounds (e.g. mobile logo chip)                                                                                                                                                     |
| `--color-foreground`                                                   | `#0f172a`                                                         | Primary text                                                                                                                                                                                                         |
| `--color-muted-foreground`                                             | `#64748b`                                                         | Secondary/placeholder text                                                                                                                                                                                           |
| `--color-border` / `--color-input`                                     | `#e7e5f3`                                                         | Borders, inputs                                                                                                                                                                                                      |
| `--color-destructive` / `--color-destructive-foreground`               | `#dc2626` / `#ffffff`                                             | Form validation errors so far — not yet a real destructive-action button                                                                                                                                             |
| `--color-success`                                                      | `#16a34a`                                                         | Defined but not yet used anywhere real                                                                                                                                                                               |
| `--color-warning` / `--color-danger` (§11 status colors)               | `[TBD]`                                                           | Still open — don't assume `--color-destructive` doubles as the §11 "danger" status color without deciding that explicitly                                                                                            |
| Card/input radius                                                      | `rounded-xl` (Tailwind's built-in 12px)                           | No custom `--radius` token was added — Tailwind v4's default `rounded-xl` already equals 12px, so the spec's "12px cards" requirement is met by the stock utility. Buttons use `rounded-full`, not the radius token. |
| Card glow                                                              | `.shadow-glow` / `.shadow-glow-sm` utility classes in `index.css` | Indigo-tinted `box-shadow` at ~12–16% opacity — the "subtle card glow" from the Cognify screen's spec, not (yet) a general convention.                                                                               |

There is still no shadcn-style semantic remapping (`--background`, `--card`, `--primary`, `--destructive`, `--ring`, etc.) — the tokens above are consumed directly as Tailwind utilities (`bg-primary`, `text-muted-foreground`, ...), not through a shadcn `:root` mapping layer, because shadcn's CLI was never run (see §5).

---

## 4. Typography — Inter, single face

`apps/web/index.html` loads Inter via Google Fonts (`wght@400;500;600;700;800`). It's used for both headings and body — there is no distinct `.font-display` class or second face, unlike the CarMan-style template this doc is adapted from. Headings use `tracking-tight` + `font-semibold`; body copy is unstyled `text-sm`/`text-[15px]`. This is one screen's worth of evidence, not a fully specified type ramp (no documented scale for h2/h3/caption sizes yet) — treat as a starting point, not a finished system.

---

## 5. shadcn/ui primitives — 5 exist, but hand-written, not CLI-generated

**Deviation from `rules/components.md`, done knowingly, not silently:** `apps/web/src/components/ui/{button,input,label,form,separator}.tsx` and `apps/web/src/lib/utils.ts` (`cn()`) now exist, built for the Cognify screen. They were **hand-authored to shadcn's standard API shape**, not produced via `npx shadcn@latest add ...`, because that CLI flow was multiple minutes per package in the environment they were built in and the screen needed to ship. They intentionally skip the Radix dependencies (`@radix-ui/react-label`, `@radix-ui/react-slot`) the canonical versions pull in — `FormControl` reimplements Slot's single-child prop-merging via `React.cloneElement` instead.

**Before building the next screen:** either (a) run the real CLI to regenerate these five and diff against the hand-written versions, accepting the Radix dependency, or (b) explicitly decide the hand-written versions are good enough to keep — but don't silently add a sixth hand-written primitive without revisiting this choice first, since `rules/components.md` still says CLI-only.

Still not installed: `dialog`, `table`, `badge`, `select`, `checkbox`, `calendar`, `textarea`, `tooltip`, `popover`, `dropdown-menu`, `sonner`, `sheet`. Same two caveats as before apply once they are:

- `dialog.tsx` needs the project's custom `showCloseButton?: boolean` prop (default `true`) per `rules/dialog.md` — it wraps `@base-ui/react/dialog`, not Radix.
- `badge.tsx` will need custom status variants once §11's colors are decided.

---

## 6. Common component library (planned) — `src/components/common/`

Not built yet. When building it, group by purpose the way the module rules expect — e.g. form-input wrappers (`FormInput`, `FormSelect`, date pickers), upload fields, layout pieces (`PageHeader`, tab bars), feedback/overlays (`ConfirmDialog`, success modals, dismissible banners), and table utilities (`SearchInput`, `FilterSelect`, pagination). Only add a wrapper here once two or more modules actually need it — don't pre-build a shared library speculatively (see `CLAUDE.md`'s general "don't build for hypothetical future requirements" guidance).

---

## 7. Layouts (planned) — `src/components/layouts/`

Not built yet. `AppShell` (sidebar + top bar + `<main>` slot) and `AppTopBar` would live here once §2 is decided.

---

## 8. Modules — `src/modules/onboarding/` is the first one

| Module       | Screens / components built                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onboarding` | `CreateAccountScreen` (Create Account / sign-up), `OnboardingLeftPanel` (shared two-panel branding side), `PasswordStrengthField`, `SocialAuthButtons` |

Structure follows `rules/modules.md`: `@types/index.ts` (component Props), `constants/index.ts` (product name, password rules), `components/<sub-feature>/`. It does **not** yet have `service/`, `utils/`, or `__tests__/` — there's no backend endpoint to call yet (see below) and no pure helpers beyond what's inline, so those folders were skipped rather than stubbed empty; add them when something real needs to go there.

Zod schema + its inferred `CreateAccountFormValues` type live in `components/create-account/schema.ts`, colocated with the form that uses them, not in `@types/index.ts` — matches `rules/typescript.md`'s "Zod schema is the source of truth" guidance better than duplicating the shape in `@types`.

**No real registration endpoint exists in `apps/api`** (only the generic `example` domain does). `CreateAccountScreen`'s submit handler validates client-side and logs via `logger`, marked `MOCK:API` — it does not call `service/api.ts` because there's nothing real to call yet. Wire this up properly once a registration endpoint exists, per `rules/api.md`.

---

## 9. Screens — correction: this repo doesn't use `src/screens/`

The original CarMan-derived version of this doc assumed a flat `src/screens/` folder (copied from that project's structure). **That's wrong for this repo** — `rules/modules.md` (the real, authoritative rule here) puts screens inside `src/modules/<feature>/components/`, and that's where `CreateAccountScreen` actually landed. This section is corrected rather than filled in: don't create a `src/screens/` folder here, and disregard this doc's earlier assumption that one would exist.

`apps/web`'s `App.tsx` no longer renders the old showcase/demo page — it now renders `CreateAccountScreen` directly. The demo content (Tailwind test grid, local counter, Redux counter, secure-storage demo, PHI-logger demo) was removed from the render tree, not deleted from the repo's history, but there is currently no way to view it without checking out an earlier commit or re-adding a route to it. There is still no router installed (`react-router-dom` is not a dependency of `apps/web`), so `App.tsx` can only ever render one screen at a time today.

---

## 10. UI patterns established

### Two-panel onboarding layout (`OnboardingLeftPanel`)

`rules/onboarding-patterns.md`'s two-panel convention is now proven with a real screen: `OnboardingLeftPanel` (`hidden lg:flex`, indigo gradient, headline + feature bullets + floating stat chips) at `lg:w-[40%]`, paired with a `flex-1 lg:w-[60%]` content column carrying the mobile logo fallback, the form, and the `© 2026 Cognify` footer — matching the rule file's layout shape, but with a 40/60 split rather than an unspecified ratio (the rule file didn't pin one). Reuse `OnboardingLeftPanel` as-is for the next onboarding screen (sign-in, forgot-password) rather than rebuilding it.

### Live password-strength meter (`PasswordStrengthField`)

Implements `rules/onboarding-patterns.md`'s `STRENGTH_RULES` pattern exactly: 4-segment bar + 2×2 checklist, driven by `form.watch`-style live `password` value with `mode: 'onChange'` on the form. Backed by a Zod schema with matching regex rules, so the visual requirements and actual validation never drift apart. Reuse for reset-password screens.

Not yet established: a section-header convention, tooltip/popover panel pattern, or a read-only detail-view context provider — none of those exist in any shipped screen yet.

---

## 11. Status / data-layer colors — `[TBD, but keep them universal once chosen]`

Convention to keep regardless of brand: status colors (active/success, pending/warning, new/info, inactive/muted, critical/danger) should be **hardcoded in `badge.tsx`** and **not** shift with theme — they're a clinical/operational convention, not a decorative one, once this app has any status semantics that matter operationally.

| Meaning             | Variant   | Background | Text    | Dot     |
| ------------------- | --------- | ---------- | ------- | ------- |
| Active / success    | `success` | `[TBD]`    | `[TBD]` | `[TBD]` |
| Pending / follow-up | `warning` | `[TBD]`    | `[TBD]` | `[TBD]` |
| New / info          | `info`    | `[TBD]`    | `[TBD]` | `[TBD]` |
| Inactive / on hold  | `muted`   | `[TBD]`    | `[TBD]` | `[TBD]` |
| Critical            | `danger`  | `[TBD]`    | `[TBD]` | —       |

If Backend AI has a safety-critical severity signal (the way CarMan's allergy-severity red was never allowed to be themed), call that out explicitly here once it exists — don't let it get merged into a generic "danger" variant.

---

## 12. Logo & brand mark — `[TBD]`

Not designed. Once it exists, record here whether the mark is hardcoded/theme-independent (as is common for brand marks) and what the wordmark capitalization is (see §1).

---

## 13. Sensitive data handling

This is already partially real, not aspirational — keep it if Backend AI handles PHI or comparable regulated data; remove this section if it doesn't apply:

- `data-phi` attribute on every element rendering sensitive identifiers, per `rules/styling.md`.
- Never `console.log` sensitive fields — use `apps/web/src/utils/logger.ts`, which already redacts PHI-shaped fields, per `rules/api.md`.
- Never put sensitive data in Redux, not even in a non-persisted slice, per `rules/state.md`. `apps/web/src/store/index.ts` already wires `redux-persist` through `apps/web/src/utils/secureStorage.ts` (AES via `crypto-js`) for whatever _is_ persisted.
- Env access only through `src/config/environment.ts` (per `CLAUDE.md`) — note `VITE_ENCRYPTION_KEY` has an insecure hardcoded fallback that must be overridden outside local dev.

---

## 14. Dependencies

### Actually installed today (`apps/web/package.json`)

`@reduxjs/toolkit`, `react-redux`, `redux-persist`, `crypto-js`, `react`/`react-dom` 19, Tailwind v4 (`@tailwindcss/postcss`), Vite, plus Jest-oriented test tooling (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jest-environment-jsdom`, `identity-obj-proxy`) — **plus, added for the Cognify screen:** `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`.

### Required by the rule files but still not installed

`shadcn/ui` (the CLI itself was never run — see §5), `@base-ui/react` (needed once `dialog.tsx` is built), `@tanstack/react-table`, `sonner`, `date-fns`, `react-router-dom`. Don't assume any of these exist until you check `apps/web/package.json` again — this list will go stale the moment the first is added.

### Vite config change worth knowing about

`apps/web/vite.config.ts` now has an explicit `resolve.alias` for `@` → `./src`. The `@nx/vite` `nxViteTsPaths()` plugin (already in the config) did **not** pick up the `@/*` path added to `tsconfig.app.json` — imports 500'd until the alias was added directly to `vite.config.ts`. If path aliases stop resolving after a tsconfig change, check whether `nxViteTsPaths()` is actually reading the updated config before assuming something else broke.

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
