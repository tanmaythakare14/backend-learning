import type { JSX } from 'react';
import { Check, Circle, CircleDot, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { hasWrittenQuestion, isChoiceCorrect, isChoiceType } from '../../utils';
import type { QuizQuestion, QuizResultProps } from '../../@types';

function OptionLine({
  label,
  chosen,
  correct,
}: {
  label: string;
  chosen: boolean;
  /** undefined while correct answers are still hidden. */
  correct: boolean | undefined;
}): JSX.Element {
  const revealed = correct !== undefined;
  const Icon =
    revealed && correct ? Check : revealed && chosen && !correct ? X : chosen ? CircleDot : Circle;

  return (
    <li
      className={cn(
        'flex items-center gap-2.5 text-sm',
        revealed && correct && 'text-primary',
        revealed && chosen && !correct && 'text-destructive',
        !revealed && !chosen && 'text-muted-foreground',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', !chosen && !(revealed && correct) && 'opacity-30')} />
      <span>{label}</span>
      {chosen && <span className="text-xs text-muted-foreground">Your answer</span>}
      {revealed && correct && !chosen && (
        <span className="text-xs text-muted-foreground">Correct answer</span>
      )}
    </li>
  );
}

function ChoiceResult({
  question,
  chosen,
  correctIds,
}: {
  question: QuizQuestion;
  chosen: string[];
  correctIds: string[] | undefined;
}): JSX.Element {
  return (
    <ul className="space-y-1.5">
      {question.options.map((option) => (
        <OptionLine
          key={option.id}
          label={option.label}
          chosen={chosen.includes(option.id)}
          correct={correctIds ? correctIds.includes(option.id) : undefined}
        />
      ))}
    </ul>
  );
}

export function QuizResult({ questions, attempt }: QuizResultProps): JSX.Element {
  const { choiceScore, correctAnswers, answers, reviewStatus } = attempt;

  return (
    <div className="space-y-6">
      <dl className="flex flex-wrap gap-x-12 gap-y-4">
        {choiceScore.total > 0 && (
          <div>
            <dt className="text-xs text-muted-foreground">Choice questions</dt>
            <dd className="text-2xl font-semibold text-foreground">
              {choiceScore.correct} of {choiceScore.total} correct
            </dd>
          </div>
        )}
        {hasWrittenQuestion(questions) && (
          <div>
            <dt className="text-xs text-muted-foreground">Written answers</dt>
            <dd className="text-2xl font-semibold text-foreground">
              {reviewStatus === 'graded' ? 'Graded' : 'Awaiting review'}
            </dd>
          </div>
        )}
      </dl>

      {!correctAnswers && choiceScore.total > 0 && (
        <p className="text-sm text-muted-foreground">
          The correct answers are shown here once the due date has passed.
        </p>
      )}

      <ol className="space-y-6 border-t border-border pt-6">
        {questions.map((question, index) => {
          const chosen = answers.choices[question.id] ?? [];
          const correctIds = correctAnswers?.[question.id];
          const text = answers.texts[question.id];

          return (
            <li key={question.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 shrink-0 text-sm text-muted-foreground">{index + 1}.</span>
                <p className="flex-1 text-sm font-medium leading-snug text-foreground">
                  {question.prompt}
                </p>
                {isChoiceType(question.type) && correctIds && (
                  <Badge variant={isChoiceCorrect(chosen, correctIds) ? 'default' : 'destructive'}>
                    {isChoiceCorrect(chosen, correctIds) ? 'Correct' : 'Incorrect'}
                  </Badge>
                )}
              </div>

              <div className="pl-9">
                {!isChoiceType(question.type) ? (
                  text ? (
                    <p className="whitespace-pre-line rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
                      {text}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No answer submitted.</p>
                  )
                ) : (
                  <ChoiceResult question={question} chosen={chosen} correctIds={correctIds} />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
