---
name: optimize-changes
description: Reviews and optimizes the code you've changed, as a pre-PR pass. Scopes to all files changed on the current branch/working tree, or one specific file the user names (which works even with no pending changes). Looks for simplification, reuse, dead code, efficiency issues, React-specific rendering/performance patterns, AND convention violations against every .claude/rules/*.md file (api, components, dialog, modules, onboarding-patterns, state, styling, testing, typescript) — does not hunt for correctness bugs. Trigger on "optimize my changes", "optimize changed files", "clean up before PR", "pre-PR review", "optimize this file's changes", "optimize this component", "check rule conventions".
---

# Optimize Changes

Pre-PR pass that optimizes code the user actually touched — never the whole
codebase, and never files outside the current change set. Complements a
correctness-focused review (that's a separate concern). This skill covers
two things together, precisely scoped per file: generic code-quality wins
(simplification, reuse, dead code, efficiency, React perf) **and** compliance
with this project's `.claude/rules/*.md` conventions. Re-read a rule file
directly if its content may have drifted since this skill was written —
don't rely solely on the summaries below for anything load-bearing.

## Step 1 — Pick a mode

If `$ARGUMENTS` already contains a file path, skip straight to **Option 2**
with that path. Otherwise ask:

- **Option 1 — Optimize all changed files.** Every file changed in the
  current diff scope (see Step 2). Strictly scoped to the diff — never
  touches a file that isn't changed.
- **Option 2 — Optimize one file.** User names a path directly. This works
  regardless of git state — the file does **not** need to appear in the
  diff scope:
  - If the named file **does** have a diff (uncommitted or on this
    branch), scope optimizations to the changed hunks, same as Option 1.
  - If the named file has **no** diff at all, naming it directly is
    authorization enough — review and optimize the whole file.
    Only check that the path exists; don't gate Option 2 on git status.

Use `AskUserQuestion` for this if it isn't already obvious from the user's
message.

## Step 2 — Determine the diff scope

Never operate on the whole repo. Compute the change set like a PR diff
would:

```
base=$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD origin/master 2>/dev/null || git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null)
git diff --name-status "$base"...HEAD          # committed on this branch
git status --porcelain                          # + uncommitted (staged/unstaged/untracked)
```

If there's no sensible base branch (e.g. detached history, no remote), fall
back to `git diff HEAD` plus `git status --porcelain` for uncommitted work.
Exclude deleted files. If nothing is changed, say so and stop — don't invent
work.

For Option 2, check whether the requested path appears in this list —
that only determines whether the file _has_ a diff (see Step 3), not
whether the request is allowed.

## Step 3 — Read with context, scope edits appropriately

For each file in scope:

- Read the **whole file** for context (naming conventions, existing
  patterns, surrounding style).
- If the file **has a diff** (always true for Option 1; true for Option 2
  when the named file is part of the change set): only propose changes
  inside or directly adjacent to the actually-changed hunks (`git diff` for
  that file). Don't refactor untouched code just because you're in the
  neighborhood.
- If the file **has no diff** (Option 2 only — a directly named file with
  nothing pending): the whole file is in scope, top to bottom.
- Either way, match the file's existing idioms rather than imposing your
  own preferences.

**Also determine which rule-file domain(s) apply**, so Step 6 only checks
what's relevant instead of running every checklist against every file:

| File matches...                                                                                       | Apply checklist(s) from            |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `src/modules/*/service/api.ts`, `mapper.ts`                                                           | api                                |
| `.tsx`/`.jsx` under `src/modules/*/components/` or `src/components/` (excluding `src/components/ui/`) | components, styling                |
| Uses `@base-ui/react/dialog`/`alert-dialog`, `DialogContent`, or `ConfirmDialog`                      | dialog                             |
| Anything under `src/modules/<feature>/`                                                               | modules                            |
| Under `src/modules/onboarding/`                                                                       | onboarding-patterns                |
| Under `src/store/`, or uses `useAppDispatch`/`useAppSelector`                                         | state                              |
| `*.test.ts`/`*.test.tsx`                                                                              | testing                            |
| Any `.ts`/`.tsx`                                                                                      | typescript (applies to everything) |

A single file often matches several rows — apply all that match.

## Step 4 — Generic optimizations

Look for, within whatever scope Step 3 established:

- **Duplication / reuse** — logic copy-pasted that already exists elsewhere
  in the file or an obvious shared location; only extract if it's genuinely
  reused, not speculatively.
- **Dead code** — unused variables, imports, branches that can't be
  reached, leftover debug statements.
- **Efficiency** — redundant recomputation, avoidable loops/allocations,
  N+1-style repeated calls, unnecessary intermediate copies.
- **Over-engineering** — abstractions, config flags, or generality the
  change doesn't need yet.
- **Readability** — naming that obscures intent, needlessly nested
  conditionals, comments that restate the code.
- **Misplaced defensiveness** — error handling/validation for cases that
  can't occur given internal guarantees; boundary validation (real user
  input, external APIs) is fine and should stay.

Do NOT flag: style nits a linter/formatter already enforces, pure
subjective preference with no measurable benefit, or anything that would
change behavior — this is a cleanup pass, not a rewrite. If you're unsure
whether a change preserves behavior, don't propose it.

## Step 5 — React-specific optimizations (when applicable)

If the file is a React component, hook, or contains JSX (`.jsx`/`.tsx`, or
a `.js`/`.ts` file that imports `react`/uses hooks), also check for these,
in the same scope as Step 3. Skip anything the file's existing patterns
already contradict (e.g. don't introduce `React.memo` into a codebase that
deliberately avoids it without saying so).

- **Unnecessary re-renders**
  - Inline object/array/function literals passed as props to a child that
    is `React.memo`-wrapped (or otherwise re-render-sensitive) — these get
    a new identity every render, defeating memoization. Hoist or wrap in
    `useMemo`/`useCallback` only when the child actually benefits.
  - Passing a whole object/context value down when only a couple of
    primitive fields are used — narrows re-render triggers if destructured
    or split.
  - Context providers whose `value` is a fresh object literal each render
    — wrap in `useMemo` so consumers don't re-render on unrelated parent
    renders.
  - Fast-changing state stored in a Context that many/expensive components
    consume — consider narrowing the provider's scope or splitting the
    context.
- **Memoization — only where it earns its cost**
  - `useMemo` for a genuinely expensive computation (not a cheap
    arithmetic/string op — memoizing those adds overhead for no benefit).
  - `useCallback` when the function identity is actually depended on
    (passed to a memoized child, or used in another hook's dependency
    array) — not reflexively on every handler.
  - `React.memo` on a component that re-renders often with unchanged props
    and does non-trivial rendering work — not on trivial/cheap components.
- **`useEffect` correctness and cost**
  - Dependency array missing values it reads (stale closures) or including
    ones that change every render (defeats the effect's purpose / causes
    loops).
  - Logic that doesn't need an effect at all — derivable state computed
    during render, or work that belongs in an event handler instead of
    reacting to a state change.
  - Effects bundling multiple unrelated concerns — split by concern so
    each has a minimal, correct dependency array.
  - Missing cleanup — subscriptions, event listeners, timers, or in-flight
    requests (`AbortController`) not torn down, causing leaks or
    setting state after unmount.
- **State design**
  - Derived values stored in `useState`/`useReducer` that could just be
    computed inline (or via `useMemo` if expensive) from existing
    props/state — avoids a sync bug and an extra render.
  - State colocated far from where it's used, causing a large subtree to
    re-render for a change only a small part needs.
  - A value that's mutated but never drives rendering — should be a
    `useRef`, not `useState`.
- **Lists**
  - `key={index}` on a list that can reorder, filter, or have items
    inserted/removed — use a stable unique id instead.
  - Very long lists rendered in full — flag as a candidate for
    virtualization (e.g. `react-window`) if the surrounding code already
    has a pattern for that; otherwise just note it.
- **Code splitting**
  - Large, rarely-shown components (modals, tabs not on initial view,
    heavy third-party widgets) imported eagerly — candidate for
    `React.lazy` + `Suspense` if the codebase already uses that pattern
    elsewhere.
- **Data fetching**
  - Fetches re-issued on every render instead of being gated by a
    dependency array or the project's existing data-fetching
    library/pattern.
  - Fetch effects with no abort/cancellation on unmount or param change.

Apply the same rule as Step 4: only flag it if it's a real, measurable win
in the changed (or whole, for no-diff Option 2) code — not a reflexive
"always memoize" pass. Over-memoizing is itself an anti-pattern (added
complexity, no measurable benefit) and should not be introduced.

## Step 6 — Rule-file convention compliance

For each domain that matched in Step 3's table, check for that domain's
violations below, in the same scope (changed hunks, or whole file for a
no-diff Option 2 target).

### api (`.claude/rules/api.md`)

- `fetch` called outside `service/api.ts` — in a component, hook, or Redux thunk.
- Missing explicit return type on an exported `service/api.ts` function.
- Response/DTO shape defined inline in `api.ts` instead of `@types/index.ts`.
- Missing `authHeaders()` on a `fetch` call — every protected route 401s silently via `handleHttpError`'s redirect without it.
- Reinvented error handling that duplicates `handleHttpError` (`src/utils/apiError.ts`).
- Raw API error message rendered to the UI instead of the `ApiError`'s already-safe `.message`.
- PII logged directly (email/phone/address) instead of routed through `src/utils/logger.ts`.
- Missing `mapper.ts` transform when a new DTO shape is consumed directly instead of mapped to a domain/list shape.
- API functions not grouped/named by entity + CRUD verb (`listX`/`getX`/`createX`/`updateX`/`deleteX`).
- Cross-module import of another module's `service/api.ts`.

### components (`.claude/rules/components.md`)

- A hand-built Input/Button/Dialog/Table/Select/Checkbox/Badge duplicating an existing shadcn/ui primitive under `src/components/ui/`.
- A shadcn primitive used but not installed (`sheet`, `chart`, `calendar`, etc.) without flagging it needs adding.
- A new table/chart library added (`@tanstack/react-table`, `recharts`) when neither is installed — a dependency decision for the team, not a unilateral import.
- Direct `@radix-ui/*` import instead of the project's `@/components/ui/*` wrapper.
- Hand-edited file under `src/components/ui/` for a one-off variant instead of a wrapper component.
- A form not using React Hook Form + Zod + shadcn `<Form>`, or a form value type defined by hand instead of `z.infer<typeof schema>`.
- A bespoke confirm modal instead of reusing the shared `ConfirmDialog`.
- Hardcoded status colors instead of `<Badge variant="...">`.
- `alert()` or a custom toast instead of `sonner`'s `toast`.
- Missing explicit return type, props defined inline instead of in `@types/index.ts`, or a default export instead of named (except a `React.lazy` entry point).

### dialog (`.claude/rules/dialog.md`)

- `hideCloseButton` passed to `DialogContent` — this project's prop is `showCloseButton={false}`.
- `dismissible`, `onPointerDownOutside`, or `onEscapeKeyDown` passed — none exist on this project's base-ui-backed `DialogContent`; will cause a TypeScript error. Omit `dismissible` entirely rather than reaching for a Radix-shaped prop.
- A bespoke confirm/alert modal instead of reusing `ConfirmDialog` (built on `@base-ui/react/alert-dialog`).
- Direct `@radix-ui/react-dialog`/`-alert-dialog` import — this project uses `@base-ui/react`, not Radix, despite similar APIs.

### modules (`.claude/rules/modules.md`)

- Business logic, API calls, or feature-specific types placed outside a module folder (in `src/` root or `src/components/`).
- A new module missing required structure: `@types/index.ts`, `service/index.ts` (`export * from './api'; export * from './mapper';`), `constants/index.ts`, or a minimal root `index.ts`.
- Layer bleed: a component making a direct `fetch` call or dispatching Redux for server data; a `service/` file containing JSX or a `react` import.
- Server/API data pushed into a Redux slice instead of component-local state.
- Module root `index.ts` exporting internals instead of only what the router/pages consume.
- A sub-folder under `components/` missing its own barrel `index.ts`.
- Cross-module import of another module's `service`, `components`, or `@types` internals.
- A multi-step form not using the `steps/` sub-folder convention, or a tabbed detail view not using `tabs/`.

### onboarding-patterns (`.claude/rules/onboarding-patterns.md`)

- A resurrected dead pattern — account-details card, password-strength bar, success-popup dialog, or demo-guide banner reappearing for a create-account/forgot-password/reset-password-style screen. Auth0 owns all of that now; flag this loudly, since it likely means a custom auth screen is being rebuilt by mistake.
- The two-panel layout not matching the one live convention (`OnboardingLeftPanel` `hidden lg:flex`, mobile-only logo block `lg:hidden`, footer inside the right panel using `mt-10`, not `absolute`).
- A hardcoded brand string instead of the `PRODUCT_NAME` constant.

### state (`.claude/rules/state.md`)

- A new `authSlice.ts` or login-thunk pattern — auth is Auth0 (`useAuth0()`), not Redux, here. Flag loudly.
- Server/API data stored in a Redux slice instead of component-local state via the service layer.
- Raw `useDispatch`/`useSelector` instead of the typed `useAppDispatch`/`useAppSelector`.
- A slice missing an explicit TypeScript interface for its state shape.
- An async thunk calling `fetch` directly instead of delegating to the service layer.
- PII or sensitive fields added to Redux state, persisted or not.
- The `redux-persist`/`secureStorage` configuration changed without an explicit, deliberate decision.
- Component-local UI state (step index, accordion, dropdown, sort order) misplaced into Redux.

### styling (`.claude/rules/styling.md`)

- Inline `style={{ ... }}` instead of Tailwind utility classes.
- Hardcoded hex/rgb colors instead of semantic tokens.
- Arbitrary pixel spacing instead of Tailwind's spacing scale.
- `!important` anywhere.
- Template-string class concatenation instead of `cn()` from `@/lib/utils`.
- A component with multiple visual variants not using `cva`.
- shadcn CSS variables redefined inline or outside `src/index.css`'s `:root` block.
- Arbitrary font sizes instead of Tailwind typography utilities.
- A sensitive field (full email, phone, address) rendered without a `data-pii` marker where the surrounding module already uses that convention — flag as a suggestion, not a hard violation, since it's not yet universally adopted.

### testing (`.claude/rules/testing.md`)

- Importing from `react-dom/test-utils` or `vitest` instead of `@testing-library/react` — `vitest` is not a dependency here.
- A test file placed outside `src/modules/<feature>/__tests__/`.
- `getByTestId` used when a semantic query (`getByRole`/`getByLabelText`/`getByText`) would work.
- `waitFor` with an arbitrary timeout instead of `findBy*`.
- Mocking individual `fetch` calls or the network instead of mocking the whole service module at its boundary.
- Missing `afterEach(() => jest.clearAllMocks())`.
- Testing implementation details instead of user-observable behavior.
- `it.only`, `it.skip`, or `describe.only` left in committed code.
- A snapshot test with no comment explaining why it's intentional.
- A custom hook test missing one of the three required cases: loading, success, error.
- Note: `jest` is not installed in this workspace as of writing — you can review test code for convention compliance but may not be able to actually run it (`ls node_modules/.bin/jest` to check); say so rather than claiming tests pass.

### typescript (`.claude/rules/typescript.md`) — applies to every `.ts`/`.tsx` file

- `any` used anywhere — should be `unknown`, narrowed via a type guard.
- An interface/type defined inline instead of the module's `@types/index.ts`.
- Missing explicit return type on an exported function.
- A form value type defined by hand instead of derived via `z.infer<typeof schema>`.
- An optional/nullable API field typed as always-present, or vice versa.
- A non-null assertion (`!`) on API-derived data instead of `??`/`||` handling.
- A Redux slice's state without an explicit interface.
- Boolean soup instead of a discriminated union for a multi-state UI.
- The `enum` keyword instead of an `as const` object + derived union type.
- Blind casting of an untrusted payload instead of casting only the known `{ data: T }` envelope shape after a `res.ok` check.
- A relative `../../` import crossing a module boundary instead of `@/`.

Apply the same restraint as Step 4: only flag genuine violations against the
rule text, not stylistic preferences the rule doesn't actually state.

## Step 7 — Report before touching anything

Present findings from Steps 4–6 together as one plain list, most-impactful
first, each with: `file_path:line` — one-sentence description of the issue
(citing the specific rule file if it's a Step 6 finding) — one-sentence
proposed fix.

Then ask whether to apply them (skip the ask if the user's original request
already said "apply" / "fix" / "just do it"). Apply only the ones the user
accepts, as minimal diffs — don't bundle in unrelated cleanup.

## Step 8 — After applying

- Re-run `tsc --noEmit` and `eslint` on the touched files, plus the existing
  test suite if one is discoverable and fast (see the `testing.md` caveat
  above — say so explicitly if `jest` isn't resolvable rather than skipping
  silently).
- Summarize what changed and note anything you deliberately left alone
  (e.g. a duplication or convention drift that's out of scope because it
  lives in an unchanged file).
