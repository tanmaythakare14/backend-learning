import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { QuizNavigatorProps } from '../../@types';

/** Progress bar plus a numbered dot per question. `current === total` is the review step. */
export function QuizNavigator({
  total,
  current,
  isAnswered,
  onGoTo,
}: QuizNavigatorProps): JSX.Element {
  const indexes = Array.from({ length: total }, (_, index) => index);
  const answeredCount = indexes.filter(isAnswered).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {current < total ? `Question ${current + 1} of ${total}` : 'Review'}
        </span>
        <span className="text-muted-foreground">
          {answeredCount} of {total} answered
        </span>
      </div>

      <div className="flex gap-1.5" aria-hidden="true">
        {indexes.map((index) => (
          <span
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              index <= current ? 'bg-primary' : 'bg-border',
            )}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Question navigation">
        {indexes.map((index) => {
          const answered = isAnswered(index);
          return (
            <button
              key={index}
              type="button"
              onClick={() => onGoTo(index)}
              aria-label={`Question ${index + 1}, ${answered ? 'answered' : 'not answered'}`}
              aria-current={index === current ? 'step' : undefined}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors',
                index === current
                  ? 'border-primary bg-primary text-primary-foreground'
                  : answered
                    ? 'border-primary/30 bg-accent-soft text-primary hover:border-primary'
                    : 'border-border text-muted-foreground hover:bg-accent-soft hover:text-primary',
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
