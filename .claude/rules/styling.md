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
<p className="text-[#374151]">Patient Name</p>
<div className="bg-[#ef4444]">Critical</div>
<span className="border-[#d1d5db]">...</span>

// Correct — semantic tokens
<p className="text-foreground">Patient Name</p>
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

The CSS custom properties (`--background`, `--primary`, etc.) are defined in `src/index.css` or `globals.css`. Never override them inline or in a style tag:

```tsx
// Wrong
<div style={{ '--primary': '#2563eb' } as React.CSSProperties}>

// Wrong — do not redefine shadcn/ui variables in component files
// :root { --primary: 221 83% 53%; }  ← belongs only in globals.css
```

If you need to customize the theme colors for this project, edit the `:root` block in `globals.css` only.

## HIPAA data attribute

Any DOM element that renders PHI (MRN, date of birth, SSN, insurance ID, full phone number, full email) must carry a `data-phi` attribute. This enables future audit tooling to detect PHI exposure.

```tsx
// Patient MRN in a table cell
<TableCell data-phi>{patient.mrn}</TableCell>

// DOB in a form field
<Input data-phi type="text" {...field} />

// Name is NOT PHI by itself — only flag combined identifiers
```

## Typography

Use Tailwind typography utilities. Do not use arbitrary font sizes.

```tsx
// Correct
<h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
<p className="text-sm text-muted-foreground">42 patients enrolled</p>

// Wrong
<h1 className="text-[22px] font-[600]">Patients</h1>
```

## Responsive layout

Use Tailwind responsive prefixes for adaptive layouts. The clinic portal is desktop-first.

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{/* KPI cards */}</div>
```
