import * as React from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { cn } from '@/lib/utils';

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;

type PositionerProps = React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>;

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<
  typeof BasePopover.Popup
> {
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  /** Which side of the trigger it opens on. Omit for Base UI's own default (bottom). */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * What to do when it does not fit. Omit for Base UI's default, which flips to the other
   * side and then falls back to the perpendicular axis (opening beside the trigger).
   */
  collisionAvoidance?: PositionerProps['collisionAvoidance'];
  /** Keep this many px clear of the viewport edge. */
  collisionPadding?: number;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      className,
      sideOffset = 8,
      align = 'start',
      side,
      collisionAvoidance,
      collisionPadding,
      ...props
    },
    ref,
  ) => (
    <BasePopover.Portal>
      <BasePopover.Positioner
        sideOffset={sideOffset}
        align={align}
        side={side}
        collisionAvoidance={collisionAvoidance}
        collisionPadding={collisionPadding}
        className="z-50"
      >
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
