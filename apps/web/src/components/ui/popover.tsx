import * as React from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { cn } from '@/lib/utils';

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<
  typeof BasePopover.Popup
> {
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, sideOffset = 8, align = 'start', ...props }, ref) => (
    <BasePopover.Portal>
      <BasePopover.Positioner sideOffset={sideOffset} align={align} className="z-50">
        <BasePopover.Popup
          ref={ref}
          className={cn(
            'w-72 rounded-xl border border-border bg-card p-3 shadow-glow-sm outline-none',
            className,
          )}
          {...props}
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  ),
);
PopoverContent.displayName = 'PopoverContent';
