import { format, formatDistanceToNowStrict } from 'date-fns';
import { QUIZ_MAX_QUESTIONS, QUIZ_MIN_QUESTIONS } from '../constants';
import type {
  Assignment,
  AssignmentKind,
  AssignmentState,
  AssignmentTab,
  QuizAnswersApiDto,
  QuizQuestion,
} from '../@types';

interface HandedIn {
  isLate: boolean;
}

export function getAssignmentState(
  dueAt: string,
  kind: AssignmentKind,
  handedIn: HandedIn | null,
  now: Date = new Date(),
): AssignmentState {
  if (handedIn) {
    // Every quiz ends in a descriptive answer a person still has to read.
    if (kind === 'quiz') return 'review';
    return handedIn.isLate ? 'late' : 'submitted';
  }
  return new Date(dueAt).getTime() < now.getTime() ? 'overdue' : 'todo';
}

export function tabForState(state: AssignmentState): AssignmentTab {
  return state === 'late' || state === 'review' ? 'submitted' : state;
}

/** "Fri, 3 Oct, 5:00 PM" */
export function formatDueDate(dueAt: string): string {
  return format(new Date(dueAt), 'EEE, d MMM, h:mm a');
}

/** "Due Fri, 3 Oct, 5:00 PM · in 2 days" */
export function formatDueLabel(dueAt: string): string {
  const relative = formatDistanceToNowStrict(new Date(dueAt), { addSuffix: true });
  return `Due ${formatDueDate(dueAt)} · ${relative}`;
}

export function formatSubmittedAt(submittedAt: string): string {
  return format(new Date(submittedAt), 'd MMM yyyy, h:mm a');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** "3 to do · 1 overdue" — or an all-clear message. */
export function summarizeAssignments(assignments: Assignment[]): string {
  const todo = assignments.filter((a) => a.state === 'todo').length;
  const overdue = assignments.filter((a) => a.state === 'overdue').length;
  const parts = [todo > 0 && `${todo} to do`, overdue > 0 && `${overdue} overdue`].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : "You're all caught up";
}

/** Soonest deadline first for open work; most recent activity first for the rest. */
export function sortForTab(assignments: Assignment[], tab: AssignmentTab): Assignment[] {
  const byDueAsc = (a: Assignment, b: Assignment): number =>
    new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();

  if (tab === 'todo') return [...assignments].sort(byDueAsc);
  if (tab === 'overdue') return [...assignments].sort((a, b) => byDueAsc(b, a));
  return [...assignments].sort(
    (a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime(),
  );
}

/**
 * The quiz format: 7–8 questions, choice questions first, exactly one
 * descriptive question and it comes last. Returns the broken rules (empty when
 * the quiz is valid) so a creator screen can show them all at once.
 */
export function validateQuizShape(questions: QuizQuestion[]): string[] {
  const problems: string[] = [];
  const count = questions.length;
  const descriptive = questions.filter((q) => q.type === 'descriptive').length;

  if (count < QUIZ_MIN_QUESTIONS || count > QUIZ_MAX_QUESTIONS) {
    problems.push(
      `A quiz needs ${QUIZ_MIN_QUESTIONS}–${QUIZ_MAX_QUESTIONS} questions, found ${count}.`,
    );
  }
  if (descriptive !== 1) {
    problems.push(`A quiz needs exactly one descriptive question, found ${descriptive}.`);
  }
  if (descriptive === 1 && questions[count - 1]?.type !== 'descriptive') {
    problems.push('The descriptive question must be last.');
  }
  questions.forEach((q, index) => {
    if (q.type !== 'descriptive' && q.options.length < 2) {
      problems.push(`Question ${index + 1} needs at least two options.`);
    }
  });
  return problems;
}

export function isQuestionAnswered(question: QuizQuestion, answers: QuizAnswersApiDto): boolean {
  if (question.type === 'descriptive') return (answers.texts[question.id] ?? '').trim().length > 0;
  return (answers.choices[question.id] ?? []).length > 0;
}

/** Multi-answer questions are all-or-nothing: the chosen set must match exactly. */
export function isChoiceCorrect(chosen: string[], correct: string[]): boolean {
  return chosen.length === correct.length && correct.every((id) => chosen.includes(id));
}

export function questionTypeLabel(type: QuizQuestion['type']): string {
  if (type === 'single') return 'Choose one answer';
  if (type === 'multiple') return 'Choose all that apply';
  return 'Written answer';
}
