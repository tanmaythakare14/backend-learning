import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import { questionTypeLabel } from '../../utils';
import type { ChoiceQuestionProps } from '../../@types';

/**
 * Renders both single-answer (radio) and multiple-answer (checkbox) questions —
 * the only difference is the input type and how a click changes the selection.
 * Native inputs on purpose: the shadcn checkbox/radio primitives aren't installed
 * here, and a native control keeps keyboard and screen-reader behaviour for free.
 */
export function ChoiceQuestion({ question, selected, onChange }: ChoiceQuestionProps): JSX.Element {
  const isSingle = question.type === 'single';

  const toggle = (optionId: string): void => {
    if (isSingle) {
      onChange([optionId]);
      return;
    }
    onChange(
      selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId],
    );
  };

  return (
    <fieldset className="space-y-4">
      <div className="space-y-1">
        <legend className="text-base font-medium leading-snug text-foreground">
          {question.prompt}
        </legend>
        <p className="text-sm text-muted-foreground">{questionTypeLabel(question.type)}</p>
      </div>

      <div className="space-y-2">
        {question.options.map((option) => {
          const checked = selected.includes(option.id);
          return (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors',
                'hover:bg-accent-soft',
                checked && 'border-primary bg-accent-soft',
              )}
            >
              <input
                type={isSingle ? 'radio' : 'checkbox'}
                name={question.id}
                checked={checked}
                onChange={() => toggle(option.id)}
                className="h-4 w-4 shrink-0 accent-primary"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
