import * as React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cn } from '@/lib/utils';

export const DropdownMenu = BaseMenu.Root;
export const DropdownMenuTrigger = BaseMenu.Trigger;

export interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<
  typeof BaseMenu.Popup
> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = 'end', sideOffset = 6, ...props }, ref) => (
    <BaseMenu.Portal>
      <BaseMenu.Positioner align={align} sideOffset={sideOffset} className="z-50">
        <BaseMenu.Popup
          ref={ref}
          className={cn(
            'min-w-[10rem] rounded-xl border border-border bg-card p-1.5 shadow-glow-sm outline-none',
            className,
          )}
          {...props}
        />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  ),
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

export interface DropdownMenuItemProps extends React.ComponentPropsWithoutRef<
  typeof BaseMenu.Item
> {
  destructive?: boolean;
}

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, destructive, ...props }, ref) => (
    <BaseMenu.Item
      ref={ref}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors',
        destructive
          ? 'text-destructive data-[highlighted]:bg-destructive/5'
          : 'text-foreground data-[highlighted]:bg-accent-soft data-[highlighted]:text-primary',
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseMenu.Separator>
>(({ className, ...props }, ref) => (
  <BaseMenu.Separator ref={ref} className={cn('my-1 h-px bg-border', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
