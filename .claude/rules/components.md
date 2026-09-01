# Component Rules

## shadcn/ui is the only UI library

Never build a custom Input, Button, Dialog, Table, Select, Checkbox, DatePicker, Badge, or any primitive that shadcn/ui already provides.

Before writing any new UI element, check if shadcn/ui has it: https://ui.shadcn.com/docs/components

## Adding shadcn/ui components

Always use the CLI — never copy-paste from the docs manually:

```bash
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add calendar
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

## Form pattern — React Hook Form + Zod + shadcn/ui Form

Every form in this project must use this pattern. No exceptions.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// 1. Define schema — this IS the source of truth for types
const patientEnrollSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mrn: z.string().min(1, 'MRN is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().min(10, 'Invalid phone number'),
});

// 2. Derive the type from the schema — never define separately
type PatientEnrollFormValues = z.infer<typeof patientEnrollSchema>;

// 3. Use the form
export function DemographicsStep({ onNext }: { onNext: (data: PatientEnrollFormValues) => void }) {
  const form = useForm<PatientEnrollFormValues>({
    resolver: zodResolver(patientEnrollSchema),
    defaultValues: { firstName: '', lastName: '', mrn: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
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
        <Button type="submit">Next</Button>
      </form>
    </Form>
  );
}
```

## Data table pattern — TanStack Table + shadcn/ui Table

For all list views (patient list, user list, billing table):

```tsx
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { PatientListItem } from '../@types';

const columns: ColumnDef<PatientListItem>[] = [
  { accessorKey: 'fullName', header: 'Patient Name' },
  { accessorKey: 'mrn', header: 'MRN' },
  { accessorKey: 'dateOfBirth', header: 'Date of Birth' },
  {
    id: 'actions',
    cell: ({ row }) => <PatientRowActions patient={row.original} />,
  },
];

export function PatientList({ data }: { data: PatientListItem[] }): JSX.Element {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Chart pattern — shadcn/ui Charts

```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

// Never import from 'recharts' directly for the container — always use ChartContainer
export function VitalsChart({ data }: { data: VitalReading[] }): JSX.Element {
  return (
    <ChartContainer config={{ bloodPressure: { label: 'Blood Pressure', color: 'hsl(var(--chart-1))' } }}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="systolic" stroke="var(--color-bloodPressure)" />
      </LineChart>
    </ChartContainer>
  );
}
```

## Alert and status indicators

Use `<Badge>` with semantic variants for patient status, program enrollment, alert severity:

```tsx
import { Badge } from '@/components/ui/badge';

// Use variant to convey meaning — never hardcode colors
<Badge variant="destructive">Critical Alert</Badge>
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Inactive</Badge>
<Badge variant="outline">Pending</Badge>
```

## Dialogs and sheets

Use `<Dialog>` for confirmations and focused actions. Use `<Sheet>` for context panels (e.g. patient context in messages view):

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
```

## Toast notifications

Use Sonner via shadcn/ui — never `alert()` or custom toast implementations:

```tsx
import { toast } from 'sonner';

toast.success('Patient enrolled successfully');
toast.error('Failed to save — please try again');
```

## Multi-step form navigation

Use shadcn/ui `<Stepper>` pattern or build step navigation using `<Tabs>` with controlled state. The stepper orchestrator component manages step state; each step is a separate component in `steps/`.

## Component file rules

- One component per file
- Explicit return type: `: JSX.Element` or `React.FC<Props>`
- Props interface defined in `@types/index.ts` — never inline in the component file
- Export as named export, not default export (except when lazy-loaded via `React.lazy`)
