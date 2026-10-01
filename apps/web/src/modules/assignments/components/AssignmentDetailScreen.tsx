import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Paperclip } from 'lucide-react';
import { ApiError } from '@/utils/apiError';
import { logger } from '@/utils/logger';
import { ASSIGNMENTS_PATH } from '../constants';
import {
  formatDueDate,
  formatDueLabel,
  formatFileSize,
  formatSubmittedAt,
  questionCountLabel,
} from '../utils';
import { apiDtoToAssignment, getAssignment, submitAssignment, submitQuiz } from '../service';
import type { AssignmentDetailState, SubmitAssignmentPayload, SubmitQuizPayload } from '../@types';
import { AssignmentStatusBadge } from './assignment-list';
import { SubmissionForm } from './submission-form';
import { QuizResult, QuizRunner } from './quiz';

function BackLink(): JSX.Element {
  return (
    <Link
      to={ASSIGNMENTS_PATH}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      All assignments
    </Link>
  );
}

export function AssignmentDetailScreen(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [loadState, setLoadState] = useState<AssignmentDetailState>({ status: 'loading' });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadState({ status: 'loading' });

    getAssignment(id)
      .then((dto) => {
        if (!cancelled) setLoadState({ status: 'success', assignment: apiDtoToAssignment(dto) });
      })
      .catch((error: unknown) => {
        logger.error('Could not load assignment', error);
        if (cancelled) return;
        setLoadState({
          status: 'error',
          message: error instanceof ApiError ? error.message : 'Failed to load this assignment.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Throws on failure so SubmissionForm can show its own error toast and keep the form as typed.
  const handleSubmit = async (payload: SubmitAssignmentPayload): Promise<void> => {
    if (!id) return;
    const dto = await submitAssignment(id, payload);
    setLoadState({ status: 'success', assignment: apiDtoToAssignment(dto) });
  };

  // Throws on failure so the confirm dialog can show the message and stay open.
  const handleQuizSubmit = async (payload: SubmitQuizPayload): Promise<void> => {
    if (!id) return;
    const dto = await submitQuiz(id, payload);
    setLoadState({ status: 'success', assignment: apiDtoToAssignment(dto) });
  };

  if (loadState.status === 'loading') {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading assignment…
        </div>
      </div>
    );
  }

  if (loadState.status === 'error') {
    return (
      <div className="space-y-6">
        <BackLink />
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {loadState.message}
        </p>
      </div>
    );
  }

  const { assignment } = loadState;
  const { submission } = assignment;
  const isPastDue = new Date(assignment.dueAt).getTime() < Date.now();

  return (
    <div className="max-w-3xl space-y-8">
      <BackLink />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {assignment.title}
          </h1>
          <AssignmentStatusBadge state={assignment.state} />
        </div>
        <p className="text-sm text-muted-foreground">
          {assignment.courseName}
          {assignment.kind === 'quiz'
            ? ` · Quiz · ${questionCountLabel(assignment.questions.length)}`
            : ''}
          {' · '}
          {formatDueLabel(assignment.dueAt)}
        </p>
      </div>

      <section className="space-y-2 border-t border-border pt-6">
        <h2 className="text-base font-semibold text-foreground">Instructions</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          {assignment.instructions}
        </p>
        <p className="text-xs text-muted-foreground">Due {formatDueDate(assignment.dueAt)}</p>
      </section>

      {assignment.kind === 'quiz' ? (
        assignment.quizAttempt ? (
          <section className="space-y-4 border-t border-border pt-6">
            <h2 className="text-base font-semibold text-foreground">Your results</h2>
            <p className="text-sm text-muted-foreground">
              Submitted {formatSubmittedAt(assignment.quizAttempt.submittedAt)}
              {assignment.quizAttempt.isLate ? ' · late' : ''}
            </p>
            <QuizResult questions={assignment.questions} attempt={assignment.quizAttempt} />
          </section>
        ) : (
          <section className="space-y-4 border-t border-border pt-6">
            <h2 className="text-base font-semibold text-foreground">Take the quiz</h2>
            <QuizRunner
              questions={assignment.questions}
              isPastDue={isPastDue}
              onSubmit={handleQuizSubmit}
            />
          </section>
        )
      ) : (
        <>
          {submission && (
            <section className="space-y-3 border-t border-border pt-6">
              <h2 className="text-base font-semibold text-foreground">Your submission</h2>
              <p className="text-sm text-muted-foreground">
                Submitted {formatSubmittedAt(submission.submittedAt)}
                {submission.isLate ? ' · late' : ''}
              </p>
              {submission.answerText && (
                <p className="whitespace-pre-line rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
                  {submission.answerText}
                </p>
              )}
              {submission.fileName && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span>{submission.fileName}</span>
                  {submission.fileSize !== null && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(submission.fileSize)}
                    </span>
                  )}
                </div>
              )}
            </section>
          )}

          <section className="space-y-4 border-t border-border pt-6">
            <h2 className="text-base font-semibold text-foreground">
              {submission ? 'Resubmit' : 'Submit your work'}
            </h2>
            {submission && (
              <p className="text-sm text-muted-foreground">
                Sending again replaces your previous submission.
              </p>
            )}
            <SubmissionForm
              hasSubmission={submission !== null}
              isPastDue={isPastDue}
              onSubmit={handleSubmit}
            />
          </section>
        </>
      )}
    </div>
  );
}
