import type { JSX } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MAX_DESCRIPTIVE_LENGTH } from '../../constants';
import { questionTypeLabel } from '../../utils';
import type { DescriptiveQuestionProps } from '../../@types';

export function DescriptiveQuestion({
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

      <Textarea
        id={inputId}
        rows={10}
        maxLength={MAX_DESCRIPTIVE_LENGTH}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your answer here"
      />
      <p className="text-right text-xs text-muted-foreground">
        {value.length} / {MAX_DESCRIPTIVE_LENGTH}
      </p>
    </div>
  );
}
