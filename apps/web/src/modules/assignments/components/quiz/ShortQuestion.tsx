import type { JSX } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MAX_SHORT_LENGTH } from '../../constants';
import { questionTypeLabel } from '../../utils';
import type { DescriptiveQuestionProps } from '../../@types';

/** A one-line written answer — the Short paragraph type. */
export function ShortQuestion({
  question,
  value,
  onChange,
}: DescriptiveQuestionProps): JSX.Element {
  const inputId = `answer-${question.id}`;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor={inputId} className="text-base font-medium leading-snug text-foreground">
          {question.prompt}
        </Label>
        <p className="text-sm text-muted-foreground">{questionTypeLabel(question.type)}</p>
      </div>

      <Input
        id={inputId}
        maxLength={MAX_SHORT_LENGTH}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Your answer"
      />
      <p className="text-right text-xs text-muted-foreground">
        {value.length} / {MAX_SHORT_LENGTH}
      </p>
    </div>
  );
}
