# Design System Rules

The design language Claude Code builds against: token values, type ramp, spacing, named layouts, the Figma-to-code mapping, and required states. This is the file that makes generated UI match the designs. Running example: a generic `Entity` feature.

> **Fill this per project.** The token values below are sample shadcn/ui defaults to show the _shape_. Replace them with your project's real values (pulled from `globals.css` / your Figma token export). The _rules_ around them stay the same.

---

## Source of truth

Design tokens are CSS variables defined **once** in `src/globals.css`, consumed everywhere via Tailwind classes that reference them. Never hardcode a hex, never redefine a variable in a component, never use inline `style={}`.

```tsx
// Wrong — hardcoded, bypasses the system
<p className="text-[#374151]">Name</p>
<div style={{ padding: 16 }} />

// Correct — semantic token classes
<p className="text-foreground">Name</p>
<div className="p-4" />
```

---

## Color tokens (semantic, not raw)

Use the semantic role, never the raw color. A button is `bg-primary`, not `bg-blue-600` — so a theme change updates everything at once.

| Token                                    | Role                               |
| ---------------------------------------- | ---------------------------------- |
| `background` / `foreground`              | Page background, primary text      |
| `card` / `card-foreground`               | Card surfaces                      |
| `primary` / `primary-foreground`         | Primary actions                    |
| `secondary` / `secondary-foreground`     | Secondary elements                 |
| `muted` / `muted-foreground`             | Disabled, placeholder, subtle text |
| `accent` / `accent-foreground`           | Hover surfaces, highlights         |
| `destructive` / `destructive-foreground` | Errors, delete, critical           |
| `border`                                 | All borders                        |
| `ring`                                   | Focus rings                        |

Sample definition (shadcn defaults — replace per project):

```css
/* src/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 240 5.9% 90%;
  --ring: 240 10% 3.9%;
  --radius: 0.5rem;
}
```

```tsx
<div className="bg-card text-card-foreground border-border" />
<button className="bg-primary text-primary-foreground" />
<div className="bg-destructive text-destructive-foreground">Error</div>
```

---

## Spacing scale

Tailwind's scale (4px increments). Never arbitrary pixel values.

| Class           | px  | Typical use                         |
| --------------- | --- | ----------------------------------- |
| `p-2` / `gap-2` | 8   | tight inner spacing                 |
| `p-4` / `gap-4` | 16  | default component padding           |
| `p-6`           | 24  | card padding, section spacing       |
| `space-y-4`     | 16  | vertical rhythm between form fields |

```tsx
// Wrong
<div className="p-[14px] mt-[24px] gap-[12px]" />
// Correct
<div className="p-4 mt-6 gap-3" />
```

---

## Type ramp

Use the ramp; never arbitrary font sizes or weights.

| Level           | Classes                                 | Use                        |
| --------------- | --------------------------------------- | -------------------------- |
| Page title      | `text-2xl font-semibold tracking-tight` | One per screen (h1)        |
| Section heading | `text-lg font-semibold`                 | Card / section titles (h2) |
| Body            | `text-sm`                               | Default body copy          |
| Body strong     | `text-sm font-medium`                   | Emphasis, labels           |
| Caption / meta  | `text-xs text-muted-foreground`         | Counts, timestamps, hints  |

```tsx
// Wrong
<h1 className="text-[22px] font-[600]">Entities</h1>
// Correct
<h1 className="text-2xl font-semibold tracking-tight">Entities</h1>
<p className="text-xs text-muted-foreground">42 items</p>
```

Headings follow hierarchical order (h1 → h2 → h3) — don't skip levels for visual size; use the ramp classes instead.

---

## Radius & elevation

Reference the tokens, never arbitrary values.

| Token        | Sample                 | Use                       |
| ------------ | ---------------------- | ------------------------- |
| `rounded-md` | `--radius` (0.5rem)    | inputs, buttons           |
| `rounded-lg` | `calc(--radius + 2px)` | cards, dialogs            |
| `shadow-sm`  | —                      | resting cards             |
| `shadow-md`  | —                      | popovers, raised surfaces |
| `shadow-lg`  | —                      | modals, hover-lift        |

```tsx
// Wrong
<div className="rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]" />
// Correct
<div className="rounded-lg shadow-sm" />
```

---

## Named layouts

Reusable page shells live in `src/components/layouts/` and are referenced by name in prompts ("use `ListLayout`"). Define the project's layouts here so Claude composes screens from them instead of inventing structure.

| Layout           | Shape                                                      | Used by                    |
| ---------------- | ---------------------------------------------------------- | -------------------------- |
| `AppShell`       | Sidebar nav + top bar + content slot                       | every authenticated screen |
| `ListLayout`     | Header (title + primary action) + toolbar + table region   | list screens               |
| `DetailLayout`   | Breadcrumb + header + tabbed/section body                  | detail screens             |
| `FormLayout`     | Centered single-column, max-w-prose, sticky footer actions | create/edit forms          |
| `SettingsLayout` | Left sub-nav + content region                              | settings-style screens     |

```tsx
// Prompt names the layout; Claude composes inside it
import { ListLayout } from '@/components/layouts';

const EntityListScreen = () => (
  <ListLayout title="Entities" primaryAction={<AppButton>New</AppButton>}>
    <EntityList data={data} />
  </ListLayout>
);
```

Rule: name the layout in the prompt. Don't let Claude invent page structure ad hoc.

---

## Figma → code mapping

Name the component in the prompt; don't let Claude guess. The hierarchy is real: a screen is composed of named components, which compose shadcn/ui primitives.

| In Figma     | In code                                    | Notes                                   |
| ------------ | ------------------------------------------ | --------------------------------------- |
| Page / Frame | a _Screen_ component inside a named layout | e.g. `EntityListScreen` in `ListLayout` |
| Card         | `<Card>` + tokens                          | never a bare styled `<div>`             |
| Input field  | `FormInput` (common wrapper)               | wraps shadcn `<Input>` + `<FormField>`  |
| Button       | `<Button>` / `AppButton` variant           | variant conveys intent                  |
| Tag / Chip   | `<Badge>` with semantic variant            | variant = meaning, not color            |
| Table        | TanStack Table + shadcn `<Table>`          | see `rules/components.md`               |
| Modal        | `<Dialog>`                                 | `<Sheet>` for side panels               |

How we think → how to prompt:

> _"An entity settings page with a few toggles."_
> → "Use `SettingsLayout`. Inside: `Card` × 2. Each contains `SwitchRow` components from `common/`."

---

## States are explicit — every interactive element

In Figma you click a variant and the state appears. In code, every state must be written or it doesn't exist. For any interactive element or async region, specify all that apply:

`default · hover · active · focus · disabled · loading · empty · error · success`

| State    | What it looks like (define per project)                    |
| -------- | ---------------------------------------------------------- |
| Loading  | skeleton in place of content, or button spinner + disabled |
| Empty    | centered message + primary CTA (no blank region)           |
| Error    | inline message in destructive token; retry affordance      |
| Success  | toast via Sonner (see `rules/constants.md` for the string) |
| Disabled | `opacity-50` + `pointer-events-none`, `aria-disabled`      |
| Focus    | visible `ring-ring` — never remove focus outlines          |

```tsx
// A list region handles all three async states — not just the happy path
if (state.status === 'loading') return <EntityListSkeleton />;
if (state.status === 'error') return <ErrorState message={state.error} onRetry={refetch} />;
if (state.data.length === 0)
  return <EmptyState title="No entities yet" action={<AppButton>New</AppButton>} />;
return <EntityList data={state.data} />;
```

If a prompt doesn't ask for a state, Claude won't build it. Ask for the states up front.

---

## Class composition & variants

- Conditional classes via `cn()` (clsx + tailwind-merge), never string concatenation.
- Multi-variant components use `cva`.
- No `!important`.

```tsx
import { cn } from '@/lib/utils';

<div
  className={cn('rounded-lg border p-4', isActive && 'border-primary bg-primary/10', className)}
/>;
```

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva('flex items-center gap-3 rounded-lg border p-4 text-sm', {
  variants: {
    severity: {
      error: 'border-destructive bg-destructive/10 text-destructive',
      warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
      info: 'border-border bg-muted text-foreground',
    },
  },
  defaultVariants: { severity: 'info' },
});
```

---

## Responsive

Mobile-first or desktop-first — state which per project. Use Tailwind responsive prefixes; never arbitrary breakpoints.

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" />
```

Touch targets ≥ 44×44px on interactive elements where touch is supported.
