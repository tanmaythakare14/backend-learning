import type { JSX } from 'react';
import type { SettingsSectionProps } from '../../@types';

/**
 * A titled block of settings. Deliberately not a card — no border, no surface,
 * no shadow. Structure comes from the heading and a single hairline rule, which
 * keeps long settings pages from turning into a stack of boxes.
 */
export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps): JSX.Element {
  return (
    <section className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <header className="mb-5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
