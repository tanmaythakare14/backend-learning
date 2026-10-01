import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ASSIGNMENTS_PATH } from '../../constants';
import { formatDueLabel, formatSubmittedAt, questionCountLabel } from '../../utils';
import type { AssignmentRowProps } from '../../@types';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';

export function AssignmentRow({ assignment }: AssignmentRowProps): JSX.Element {
  const { id, title, courseName, dueAt, submittedAt, state, kind, questions } = assignment;

  return (
    <Link
      to={`${ASSIGNMENTS_PATH}/${id}`}
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent-soft"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {courseName}
          {kind === 'quiz' ? ` · Quiz · ${questionCountLabel(questions.length)}` : ''}
        </p>
      </div>

      <p
        className={cn(
          'hidden shrink-0 text-xs text-muted-foreground sm:block',
          state === 'overdue' && 'text-destructive',
        )}
      >
        {submittedAt ? `Submitted ${formatSubmittedAt(submittedAt)}` : formatDueLabel(dueAt)}
      </p>

      <AssignmentStatusBadge state={state} />
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
