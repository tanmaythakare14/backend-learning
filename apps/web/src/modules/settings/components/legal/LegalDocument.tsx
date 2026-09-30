import type { JSX } from 'react';
import type { LegalDocumentProps } from '../../@types';

/** Shared renderer for the Terms and Privacy panels — same shape, different copy. */
export function LegalDocument({ title, intro, sections }: LegalDocumentProps): JSX.Element {
  return (
    <article className="space-y-6">
      <p className="text-sm leading-relaxed text-muted-foreground">{intro}</p>

      <div className="space-y-5">
        {sections.map(({ heading, body }) => (
          <section key={heading} className="space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Questions about {title.toLowerCase()}? Contact your organisation&rsquo;s administrator.
      </p>
    </article>
  );
}
