import type { JSX } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { cn } from '@/lib/utils';
import type { QuizOutlineProps } from '../../@types';
import type { AssignmentBuilderSchemaValues } from './schema';
import { QUESTION_TYPE_ICONS } from './questionTypeIcons';

/**
 * The builder's side rail: a jump list of the questions. It reads the form itself (and is
 * the only thing that re-renders as the prompts are typed), so the rest of the screen
 * stays still.
 */
export function QuizOutline({ onJump }: QuizOutlineProps): JSX.Element {
  const { control } = useFormContext<AssignmentBuilderSchemaValues>();
  const questions = useWatch({ control, name: 'questions' }) ?? [];

  return (
    <aside
      aria-label="Quiz outline"
      className="space-y-2.5 rounded-xl border border-border bg-card p-4"
    >
      <h2 className="text-sm font-semibold text-foreground">Questions</h2>
      {questions.length === 0 ? (
        <p className="text-xs text-muted-foreground">No questions yet.</p>
      ) : (
        <ol className="space-y-0.5">
          {questions.map((question, index) => {
            const Icon = QUESTION_TYPE_ICONS[question.type];
            const prompt = question.prompt.trim();
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => onJump(index)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent-soft"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span
                    className={cn('truncate', prompt ? 'text-foreground' : 'text-muted-foreground')}
                  >
                    {prompt || 'Untitled question'}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
