# Component Rules

## shadcn/ui is the only UI library

Never build a custom Input, Button, Dialog, Table, Select, Checkbox, Badge, or any primitive that shadcn/ui already provides. Currently installed under `src/components/ui/`: avatar, badge, button, combobox, dialog, dropdown-menu, form, input, label, popover, scroll-area, select, separator, sonner, table, tabs, textarea.

Before writing any new UI element, check if shadcn/ui has it: https://ui.shadcn.com/docs/components

**Don't reach for a primitive that isn't listed above (e.g. `sheet`, `chart`, `calendar`, `checkbox`) without adding it first** — see below. And don't add a whole new charting/table library (`recharts`, `@tanstack/react-table`, etc.) to solve something shadcn's existing primitives can already do with a plain `.map()` — none of those packages are installed in this project.

## Adding shadcn/ui components

Use the CLI rather than copy-pasting from the docs manually — but note **this project has no `components.json`** (the file the CLI normally uses to know the style/aliases/CSS path it already used). Running `npx shadcn@latest add <component>` without one will prompt to initialize the project first; do **not** accept those init prompts blindly, since defaults can rewrite `index.css`, `tailwind.config.js`, or path aliases and break the existing build. Point it at the project's existing conventions (Tailwind v4 via `@import 'tailwindcss'` in `index.css`, `@/*` aliases, `cn()` in `src/lib/utils.ts`) if it asks, or hand-add the component file matching the style of an existing one in `src/components/ui/` if that's simpler than steering the CLI through init.

```bash
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add dialog
```

This writes files to `src/components/ui/`. Never hand-edit those files. If you need a variant, wrap the component instead.

## Import from `@/components/ui/`

```tsx
// Correct
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Wrong — never install or import from @radix-ui directly in feature code
import * as Dialog from '@radix-ui/react-dialog';
```

Note: dialogs in this project use `@base-ui/react/dialog` under the hood, not Radix — see [dialog.md](dialog.md) for the API differences that matter when wrapping `DialogContent`.

## Form pattern — React Hook Form + Zod + shadcn/ui Form

Every form in this project must use this pattern. No exceptions.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// 1. Define schema — this IS the source of truth for types
const studentFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  course: z.string().min(1, 'Course is required'),
});

// 2. Derive the type from the schema — never define separately
type StudentFormValues = z.infer<typeof studentFormSchema>;

// 3. Use the form
export function StudentForm({
  onSubmit,
}: {
  onSubmit: (data: StudentFormValues) => void;
}): JSX.Element {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', course: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter first name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

## Data table pattern — shadcn/ui Table (no table library installed)

`@tanstack/react-table` is **not** a dependency here — don't add it. List views map rows directly with shadcn's `<Table>` primitives, following the existing `StudentTable.tsx`:

```tsx
import type { JSX } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Student } from '../../@types';

export function StudentTable({ students }: { students: Student[] }): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Student ID</TableHead>
          <TableHead>Course</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
            <TableCell>{student.studentId}</TableCell>
            <TableCell>{student.course}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

If a future screen genuinely needs sorting/pagination/filtering complex enough to justify TanStack Table, that's a dependency decision to raise with the team first — don't add it unilaterally because a rule doc mentions the pattern.

## Charts

No chart library (`recharts` or otherwise) and no `@/components/ui/chart` are installed in this project today. If a screen needs a chart, that's a dependency decision to make explicitly with the team before writing code against it — don't assume shadcn's chart wrapper exists.

## Alert and status indicators

Use `<Badge>` with semantic variants for student status, enrollment state, alert severity:

```tsx
import { Badge } from '@/components/ui/badge';

// Use variant to convey meaning — never hardcode colors
<Badge variant="destructive">Deleted</Badge>
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Deactivated</Badge>
<Badge variant="outline">Pending</Badge>
```

## Dialogs

Use `<Dialog>` for confirmations and focused actions (see the existing `ConfirmDialog.tsx`, `AddEditStudentDialog.tsx`). `<Sheet>` is **not** installed in this project — don't import `@/components/ui/sheet` without adding it first via the CLI (mind the `components.json` caveat above).

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
```

## Toast notifications

Use Sonner via shadcn/ui — never `alert()` or custom toast implementations:

```tsx
import { toast } from 'sonner';

toast.success('Student added successfully');
toast.error('Failed to save — please try again');
```

## Multi-step form navigation

No `<Stepper>` component is installed. Build step navigation with local component state (`useState` for the current step index) and conditionally render each step component; see [modules.md](modules.md) for the `steps/` folder convention.

## Component file rules

- One component per file
- Explicit return type: `: JSX.Element` or `React.FC<Props>`
- Props interface defined in `@types/index.ts` — never inline in the component file
- Export as named export, not default export (except when lazy-loaded via `React.lazy`)
