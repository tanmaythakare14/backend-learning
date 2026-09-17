# Styling Rules

## Tailwind utility classes only

Never use inline `style={}` objects in JSX. All visual styling goes through Tailwind utility classes.

```tsx
// Wrong
<div style={{ display: 'flex', gap: '16px', backgroundColor: '#f4f4f5' }}>

// Correct
<div className="flex gap-4 bg-zinc-100">
```

## Colors via semantic tokens — never hardcoded hex

shadcn/ui defines CSS variables in `globals.css` (`--background`, `--foreground`, `--primary`, `--destructive`, etc.). Use the Tailwind classes that reference these variables:

```tsx
// Wrong — hardcoded colors
<p className="text-[#374151]">Student Name</p>
<div className="bg-[#ef4444]">Critical</div>
<span className="border-[#d1d5db]">...</span>

// Correct — semantic tokens
<p className="text-foreground">Student Name</p>
<div className="bg-destructive text-destructive-foreground">Critical</div>
<span className="border-border">...</span>
```

Common semantic color tokens:

| Token                                            | Use case                                |
| ------------------------------------------------ | --------------------------------------- |
| `bg-background` / `text-foreground`              | Page background and primary text        |
| `bg-card` / `text-card-foreground`               | Card backgrounds                        |
| `bg-primary` / `text-primary-foreground`         | Primary action buttons                  |
| `bg-secondary` / `text-secondary-foreground`     | Secondary elements                      |
| `bg-muted` / `text-muted-foreground`             | Disabled, placeholder, subtle text      |
| `bg-destructive` / `text-destructive-foreground` | Errors, delete actions, critical alerts |
| `border-border`                                  | All borders                             |
| `ring-ring`                                      | Focus rings                             |

## Spacing via Tailwind scale

Never use arbitrary pixel values. Tailwind's spacing scale maps to 4px increments.

```tsx
// Wrong
<div className="p-[14px] mt-[24px] gap-[12px]">

// Correct
<div className="p-3 mt-6 gap-3">
```

Common spacing: `p-2` (8px), `p-4` (16px), `p-6` (24px), `gap-2` (8px), `gap-4` (16px), `space-y-4`.

## No `!important`

If you need to override a style, use Tailwind's specificity or a wrapper class. Never add `!important`.

## Class composition with `cn()`

The project uses `clsx` + `tailwind-merge` via a `cn()` utility. Use it whenever classes are conditional:

```tsx
import { cn } from '@/lib/utils';

// Correct — merge conditional classes safely
<div className={cn('rounded-md border p-4', isActive && 'border-primary bg-primary/10', className)}>

// Wrong — string concatenation breaks tailwind-merge deduplication
<div className={`rounded-md border p-4 ${isActive ? 'border-primary' : ''}`}>
```

## Component variants with `cva`

When a component has multiple visual variants, use `class-variance-authority`:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('flex items-center gap-3 rounded-lg border p-4 text-sm', {
  variants: {
    severity: {
      critical: 'border-destructive bg-destructive/10 text-destructive',
      warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
      info: 'border-blue-500 bg-blue-50 text-blue-800',
    },
  },
  defaultVariants: { severity: 'info' },
});

interface AlertBannerProps extends VariantProps<typeof alertVariants> {
  message: string;
  className?: string;
}

export function AlertBanner({ severity, message, className }: AlertBannerProps): JSX.Element {
  return <div className={cn(alertVariants({ severity }), className)}>{message}</div>;
}
```

## shadcn/ui CSS variables — only in `globals.css`

The CSS custom properties (`--background`, `--primary`, etc.) are defined in `src/index.css` (this project has no separate `globals.css`). Never override them inline or in a style tag:

```tsx
// Wrong
<div style={{ '--primary': '#2563eb' } as React.CSSProperties}>

// Wrong — do not redefine shadcn/ui variables in component files
// :root { --primary: 221 83% 53%; }  ← belongs only in globals.css
```

If you need to customize the theme colors for this project, edit the `:root` block in `src/index.css` only.

## Sensitive-field data attribute

This project's boilerplate origin includes PHI/HIPAA-flavored security infra (`utils/logger.ts` redacts PII by pattern, `VITE_DISABLE_PHI_REDACTION` env flag) even though the current product (student/course management) isn't handling health records. No `data-phi` (or equivalent) attribute is actually used anywhere in the codebase today — this is a forward-looking convention, not an enforced one yet. If you do add one for a screen showing student contact details, mark full email, full phone, or full address the same way: `data-pii`, not `data-phi` (this app has no PHI).

```tsx
// Optional convention — not yet adopted elsewhere in the codebase
<TableCell data-pii>{student.email}</TableCell>
<Input data-pii type="text" {...field} />

// Student name and studentId are NOT sensitive by themselves
```

## Typography

Use Tailwind typography utilities. Do not use arbitrary font sizes.

```tsx
// Correct
<h1 className="text-2xl font-semibold tracking-tight">Students</h1>
<p className="text-sm text-muted-foreground">42 students enrolled</p>

// Wrong
<h1 className="text-[22px] font-[600]">Students</h1>
```

## Responsive layout

Use Tailwind responsive prefixes for adaptive layouts. The app is desktop-first.

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{/* KPI cards */}</div>
```
