import { useEffect, useRef, useState } from 'react';
import type { JSX, KeyboardEvent } from 'react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CalendarGridProps {
  /** Any date inside the month being shown. */
  month: Date;
  selected: Date | null;
  /** Days before this are shown but cannot be chosen. */
  minDate?: Date;
  onMonthChange: (month: Date) => void;
  onSelect: (day: Date) => void;
}

const WEEK_OPTIONS = { weekStartsOn: 1 } as const;
const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const DAY_KEY = 'yyyy-MM-dd';

/**
 * A month grid with a roving tab stop: Tab enters the grid once, arrow keys move by day
 * or week, PageUp/PageDown change month, Enter/Space picks. Unavailable days use
 * aria-disabled (not `disabled`) so the arrow keys can still travel across them.
 */
export function CalendarGrid({
  month,
  selected,
  minDate,
  onMonthChange,
  onSelect,
}: CalendarGridProps): JSX.Element {
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedDay, setFocusedDay] = useState<Date>(selected ?? month);
  const [pendingFocus, setPendingFocus] = useState(false);

  const earliest = minDate ? startOfDay(minDate) : null;
  const isUnavailable = (day: Date): boolean => earliest !== null && isBefore(day, earliest);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), WEEK_OPTIONS),
    end: endOfWeek(endOfMonth(month), WEEK_OPTIONS),
  });

  // The one day that is reachable with Tab: the focused day if it is in view, else the
  // selected day, else the first of the month.
  const tabStop = isSameMonth(focusedDay, month)
    ? focusedDay
    : selected && isSameMonth(selected, month)
      ? selected
      : startOfMonth(month);

  // Move real DOM focus after the keyboard moved the logical focus (and maybe the month).
  useEffect(() => {
    if (!pendingFocus) return;
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-day="${format(focusedDay, DAY_KEY)}"]`)
      ?.focus();
    setPendingFocus(false);
  }, [pendingFocus, focusedDay, month]);

  const moveFocus = (next: Date): void => {
    setFocusedDay(next);
    if (!isSameMonth(next, month)) onMonthChange(next);
    setPendingFocus(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const steps: Record<string, Date | undefined> = {
      ArrowLeft: addDays(tabStop, -1),
      ArrowRight: addDays(tabStop, 1),
      ArrowUp: addDays(tabStop, -7),
      ArrowDown: addDays(tabStop, 7),
      PageUp: subMonths(tabStop, 1),
      PageDown: addMonths(tabStop, 1),
      Home: startOfWeek(tabStop, WEEK_OPTIONS),
      End: endOfWeek(tabStop, WEEK_OPTIONS),
    };
    const next = steps[event.key];
    if (!next) return;
    event.preventDefault();
    moveFocus(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(month, 1))}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p aria-live="polite" className="text-sm font-semibold text-foreground">
          {format(month, 'MMMM yyyy')}
        </p>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-primary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        role="grid"
        aria-label={format(month, 'MMMM yyyy')}
        ref={gridRef}
        onKeyDown={handleKeyDown}
      >
        <div role="row" className="mb-1 grid grid-cols-7">
          {WEEKDAY_LABELS.map((label) => (
            <span
              key={label}
              role="columnheader"
              className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map((day) => {
            const unavailable = isUnavailable(day);
            const isSelected = selected !== null && isSameDay(day, selected);
            const inMonth = isSameMonth(day, month);

            return (
              <button
                key={format(day, DAY_KEY)}
                type="button"
                role="gridcell"
                data-day={format(day, DAY_KEY)}
                tabIndex={isSameDay(day, tabStop) ? 0 : -1}
                aria-label={format(day, 'd MMMM yyyy')}
                aria-selected={isSelected}
                aria-disabled={unavailable}
                onClick={() => {
                  if (unavailable) return;
                  setFocusedDay(day);
                  onSelect(day);
                }}
                className={cn(
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  inMonth ? 'text-foreground' : 'text-muted-foreground/60',
                  !unavailable && !isSelected && 'hover:bg-accent-soft hover:text-primary',
                  isToday(day) &&
                    !isSelected &&
                    'font-semibold text-primary ring-1 ring-primary/30',
                  isSelected && 'bg-primary font-semibold text-primary-foreground',
                  unavailable && 'cursor-not-allowed opacity-40 line-through',
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
