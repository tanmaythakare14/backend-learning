import { useRef, useState } from 'react';
import type { AriaAttributes, JSX } from 'react';
import { format, isValid, parse, set, startOfDay } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarGrid } from './CalendarGrid';

export interface DateTimePickerProps {
  /** "yyyy-MM-ddTHH:mm" (what a datetime-local input would hold), or "" for none. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Earlier days are shown but cannot be chosen. */
  minDate?: Date;
  className?: string;
  // Forwarded to the trigger so <FormControl> can wire up label, error and hint.
  id?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
  'aria-describedby'?: string;
}

const VALUE_FORMAT = "yyyy-MM-dd'T'HH:mm";
/** A deadline picked without choosing a time lands at the end of that day. */
const DEFAULT_HOUR = 23;
const DEFAULT_MINUTE = 59;

const TIME_PRESETS = [
  { label: '9:00 AM', hour: 9, minute: 0 },
  { label: '12:00 PM', hour: 12, minute: 0 },
  { label: '5:00 PM', hour: 17, minute: 0 },
  { label: '11:59 PM', hour: 23, minute: 59 },
];

/** Gap between the field and the calendar. */
const POPUP_OFFSET = 8;
/** Keep the calendar this far clear of the bottom of the window. */
const POPUP_EDGE_MARGIN = 16;
/** The popup's natural height (a six-week month is the tallest). Used to make room before it opens. */
const POPUP_HEIGHT_ESTIMATE = 330;

/** The nearest ancestor that actually scrolls, or null. */
function closestScrollContainer(element: HTMLElement): HTMLElement | null {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const { overflowY } = getComputedStyle(parent);
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
  }
  return null;
}

const HOURS_12 = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

const SELECT_CLASSES = cn(
  'h-9 rounded-lg border border-input bg-card px-2 text-sm text-foreground transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

function parseValue(value: string): Date | null {
  if (!value) return null;
  const parsed = parse(value, VALUE_FORMAT, new Date());
  return isValid(parsed) ? parsed : null;
}

function atTime(day: Date, hour: number, minute: number): Date {
  return set(startOfDay(day), { hours: hour, minutes: minute });
}

/**
 * A date-and-time picker: a month calendar plus a time row, in a popover. Replaces the
 * browser's native datetime-local control, which looks different in every browser and
 * cannot be styled. Value in and out is the same string a datetime-local input uses, so
 * it drops into existing forms and `new Date(value)` still reads it as local time.
 */
export function DateTimePicker({
  value,
  onChange,
  onBlur,
  placeholder = 'Pick a date and time',
  disabled,
  minDate,
  className,
  ...aria
}: DateTimePickerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = parseValue(value);
  const [month, setMonth] = useState<Date>(() => selected ?? minDate ?? new Date());

  const hour24 = selected ? selected.getHours() : DEFAULT_HOUR;
  const minute = selected ? selected.getMinutes() : DEFAULT_MINUTE;
  const isPm = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const emit = (day: Date, hour: number, nextMinute: number): void => {
    onChange(format(atTime(day, hour, nextMinute), VALUE_FORMAT));
  };

  /**
   * The calendar opens directly below the field. When the field sits low on the screen there
   * is not enough room for it there, so before opening, scroll the form just far enough to
   * make room. If the form cannot scroll (a short form in a short window) the popup flips to
   * open above the field instead; only if neither fits does it scroll inside itself.
   */
  const makeRoomBelow = (): void => {
    const trigger = triggerRef.current;
    const scroller = trigger ? closestScrollContainer(trigger) : null;
    if (!trigger || !scroller) return;

    const room =
      window.innerHeight -
      trigger.getBoundingClientRect().bottom -
      POPUP_OFFSET -
      POPUP_EDGE_MARGIN;
    const shortfall = POPUP_HEIGHT_ESTIMATE - room;
    // Instant, not smooth: the popup decides below-or-above as it opens, so the room has to
    // exist already rather than arrive mid-animation.
    if (shortfall > 0) scroller.scrollBy({ top: shortfall, behavior: 'auto' });
  };

  const handleOpenChange = (next: boolean): void => {
    setOpen(next);
    if (next) {
      setMonth(selected ?? minDate ?? new Date());
      makeRoomBelow();
    } else {
      onBlur?.();
    }
  };

  // Time controls only make sense once there is a day to put the time on.
  const setTime = (hour: number, nextMinute: number): void => {
    if (selected) emit(selected, hour, nextMinute);
  };

  const to24 = (hour: number, pm: boolean): number => (hour % 12) + (pm ? 12 : 0);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-input bg-card px-4 text-left text-sm text-foreground transition-colors',
              'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              'aria-[invalid=true]:border-destructive',
              'disabled:cursor-not-allowed disabled:opacity-50',
              !selected && 'text-muted-foreground',
              className,
            )}
            {...aria}
          >
            <span className="truncate">
              {selected ? format(selected, 'EEE, d MMM yyyy · h:mm a') : placeholder}
            </span>
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={POPUP_OFFSET}
        // Below the field whenever there is room (makeRoomBelow tries to create it); above only
        // if the window is too short for that; never beside it. Last resort: scroll inside.
        collisionAvoidance={{ side: 'flip', align: 'shift', fallbackAxisSide: 'none' }}
        collisionPadding={POPUP_EDGE_MARGIN}
        className="flex w-max max-w-[calc(100vw-2rem)] max-h-[var(--available-height)] flex-wrap gap-4 overflow-y-auto p-3"
        aria-label="Choose date and time"
      >
        {/* Calendar and time sit side by side: keeping the popup short is what lets it open
            fully below the field on an ordinary screen. */}
        <div className="w-64">
          <CalendarGrid
            month={month}
            selected={selected}
            minDate={minDate}
            onMonthChange={setMonth}
            onSelect={(day) => emit(day, hour24, minute)}
          />
        </div>

        <div className="flex w-52 flex-col justify-between gap-3 border-border md:border-l md:pl-4">
          <div className="space-y-3">
            <span className="block text-sm font-medium text-foreground">Time</span>

            <div className="flex items-center gap-1.5">
              <select
                aria-label="Hour"
                className={cn(SELECT_CLASSES, 'flex-1')}
                disabled={!selected}
                value={hour12}
                onChange={(event) => setTime(to24(Number(event.target.value), isPm), minute)}
              >
                {HOURS_12.map((hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="text-muted-foreground">
                :
              </span>
              <select
                aria-label="Minute"
                className={cn(SELECT_CLASSES, 'flex-1')}
                disabled={!selected}
                value={minute}
                onChange={(event) => setTime(hour24, Number(event.target.value))}
              >
                {MINUTES.map((option) => (
                  <option key={option} value={option}>
                    {String(option).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <div
              role="group"
              aria-label="AM or PM"
              className="grid grid-cols-2 rounded-lg bg-muted p-0.5"
            >
              {(['AM', 'PM'] as const).map((period) => {
                const active = (period === 'PM') === isPm;
                return (
                  <button
                    key={period}
                    type="button"
                    aria-pressed={active}
                    disabled={!selected}
                    onClick={() => setTime(to24(hour12, period === 'PM'), minute)}
                    className={cn(
                      'h-8 rounded-md text-xs font-semibold transition-colors',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      active
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {period}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={!selected}
                  onClick={() => setTime(preset.hour, preset.minute)}
                  className={cn(
                    'rounded-full border border-border px-2 py-1 text-xs text-muted-foreground transition-colors',
                    'hover:border-primary/40 hover:bg-accent-soft hover:text-primary',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {!selected && (
              <p className="text-xs text-muted-foreground">Pick a day to set the time.</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!selected}
              onClick={() => onChange('')}
            >
              Clear
            </Button>
            <Button type="button" size="sm" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
