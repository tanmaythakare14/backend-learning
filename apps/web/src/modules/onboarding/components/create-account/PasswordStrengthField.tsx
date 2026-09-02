import type { JSX } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PASSWORD_STRENGTH_RULES, PASSWORD_STRENGTH_LABELS } from '../../constants';
import type { PasswordStrengthFieldProps } from '../../@types';

export function PasswordStrengthField({ password }: PasswordStrengthFieldProps): JSX.Element {
  const passed = PASSWORD_STRENGTH_RULES.map((rule) => rule.test(password));
  const score = passed.filter(Boolean).length;
  const label = password.length === 0 ? null : PASSWORD_STRENGTH_LABELS[Math.max(score - 1, 0)];

  const barColor =
    score <= 1
      ? 'bg-destructive'
      : score === 2
        ? 'bg-amber-500'
        : score === 3
          ? 'bg-emerald-500'
          : 'bg-primary';

  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full bg-border transition-colors',
              index < score && barColor,
            )}
          />
        ))}
      </div>

      {label && (
        <p
          className={cn(
            'text-xs font-medium',
            score <= 1 ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {label} password
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {PASSWORD_STRENGTH_RULES.map((rule, index) => (
          <div key={rule.label} className="flex items-center gap-1.5 text-[12px]">
            {passed[index] ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            )}
            <span className={passed[index] ? 'text-foreground' : 'text-muted-foreground'}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
