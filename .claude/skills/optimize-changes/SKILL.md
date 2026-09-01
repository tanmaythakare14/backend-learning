---
name: optimize-changes
description: Reviews and optimizes the code you've changed, as a pre-PR pass. Scopes to all files changed on the current branch/working tree, or one specific file the user names (which works even with no pending changes). Looks for simplification, reuse, dead code, efficiency issues, and — for React components/hooks — React-specific rendering and performance patterns; does not hunt for correctness bugs. Trigger on "optimize my changes", "optimize changed files", "clean up before PR", "pre-PR review", "optimize this file's changes", "optimize this component".
---

# Optimize Changes

Pre-PR pass that optimizes code the user actually touched — never the whole
codebase, and never files outside the current change set. Complements a
correctness-focused review (that's a separate concern); this skill only
looks for simplification, reuse, dead code, and efficiency wins.

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
that only determines whether the file *has* a diff (see Step 3), not
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

## Step 4 — What counts as an optimization

Look for, within whatever scope Step 3 established (changed hunks, or the
whole file for a no-diff Option 2 target):

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
in the same scope as Step 3 (changed hunks, or whole file for a no-diff
Option 2 target). Skip anything the file's existing patterns already
contradict (e.g. don't introduce `React.memo` into a codebase that
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

## Step 6 — Report before touching anything

Present findings as a plain list, most-impactful first, each with:
`file_path:line` — one-sentence description of the issue — one-sentence
proposed fix.

Then ask whether to apply them (skip the ask if the user's original request
already said "apply" / "fix" / "just do it"). Apply only the ones the user
accepts, as minimal diffs — don't bundle in unrelated cleanup.

## Step 7 — After applying

- Re-run whatever the repo uses to verify correctness after a refactor
  (existing test suite / typecheck / build), if one is discoverable and
  fast. If nothing is discoverable, say so instead of skipping silently.
- Summarize what changed and note anything you deliberately left alone
  (e.g. a duplication that's out of scope because it lives in an unchanged
  file).
