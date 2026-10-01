import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = BaseSelect.Root;
export const SelectValue = BaseSelect.Value;

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Trigger
    ref={ref}
    className={cn(
      'flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-4 text-sm text-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      'data-[placeholder]:text-muted-foreground',
      className,
    )}
    {...props}
  >
    {children}
    <BaseSelect.Icon>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
    </BaseSelect.Icon>
  </BaseSelect.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Popup>
>(({ className, ...props }, ref) => (
  <BaseSelect.Portal>
    <BaseSelect.Positioner sideOffset={8} alignItemWithTrigger={false} className="z-50">
      <BaseSelect.Popup
        ref={ref}
        className={cn(
          'max-h-64 w-[var(--anchor-width)] overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-glow-sm outline-none',
          className,
        )}
        {...props}
      />
    </BaseSelect.Positioner>
  </BaseSelect.Portal>
));
SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Item> & { children: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <BaseSelect.Item
    ref={ref}
    className={cn(
      'flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-sm outline-none',
      'data-[highlighted]:bg-accent-soft data-[highlighted]:text-primary',
      className,
    )}
    {...props}
  >
    <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    <BaseSelect.ItemIndicator>
      <Check className="h-4 w-4 text-primary" />
    </BaseSelect.ItemIndicator>
  </BaseSelect.Item>
));
SelectItem.displayName = 'SelectItem';
