import type { JSX } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { QuizReviewProps } from '../../@types';

export function QuizReview({
  questions,
  isAnswered,
  isPastDue,
  isSubmitting,
  onGoTo,
  onSubmitClick,
}: QuizReviewProps): JSX.Element {
  const unanswered = questions.filter((_, index) => !isAnswered(index)).length;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Review your answers</h3>
        <p className="text-sm text-muted-foreground">
          {unanswered === 0
            ? 'Every question is answered. You can still change any of them before you submit.'
            : `${unanswered} ${unanswered === 1 ? 'question is' : 'questions are'} not answered yet.`}
        </p>
      </div>

      <ol className="divide-y divide-border border-y border-border">
        {questions.map((question, index) => {
          const answered = isAnswered(index);
          return (
            <li key={question.id} className="flex items-center gap-3 py-3">
              <span className="w-6 shrink-0 text-sm text-muted-foreground">{index + 1}.</span>
              <p className="min-w-0 flex-1 truncate text-sm text-foreground">{question.prompt}</p>
              <Badge variant={answered ? 'default' : 'secondary'}>
                {answered ? 'Answered' : 'Not answered'}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onGoTo(index)}
                aria-label={`Go to question ${index + 1}`}
              >
                {answered ? 'Edit' : 'Answer'}
              </Button>
            </li>
          );
        })}
      </ol>

      {isPastDue && (
        <p className="text-sm text-destructive">
          This quiz is past its due date — your submission will be marked late.
        </p>
      )}

      <div className="flex items-center justify-end">
        <Button type="button" onClick={onSubmitClick} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit quiz
        </Button>
      </div>
    </div>
  );
}
