import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import { SETTINGS_NAV_GROUPS } from '../../constants';
import type { SettingsNavProps } from '../../@types';

export function SettingsNav({ activeSection, onSelect }: SettingsNavProps): JSX.Element {
  return (
    <nav aria-label="Settings sections" className="w-52 shrink-0 self-start">
      {SETTINGS_NAV_GROUPS.map(({ label, items }) => (
        <div key={label} className="mb-6 last:mb-0">
          <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>

          <ul className="space-y-0.5">
            {items.map(({ id, label: itemLabel }) => {
              const isActive = id === activeSection;

              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onSelect(id)}
                    className={cn(
                      'w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      // accent-soft, not accent — in this project --color-accent is
                      // full-strength indigo and would swallow the label.
                      isActive
                        ? 'bg-accent-soft font-medium text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent-soft/50 hover:text-foreground',
                    )}
                  >
                    {itemLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
