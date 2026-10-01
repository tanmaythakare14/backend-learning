import { format, formatDistanceToNowStrict } from 'date-fns';
import { MIN_OPTIONS, QUIZ_MIN_QUESTIONS } from '../constants';
import type {
  Assignment,
  AssignmentKind,
  AssignmentState,
  AssignmentTab,
  BuilderQuestionValues,
  QuizAnswersApiDto,
  QuizQuestion,
  QuizQuestionType,
} from '../@types';

interface HandedIn {
  isLate: boolean;
}

export function getAssignmentState(
  dueAt: string,
  kind: AssignmentKind,
  handedIn: HandedIn | null,
  /** A quiz with a Short/Long paragraph question still needs a person to read it. */
  needsReview: boolean,
  now: Date = new Date(),
): AssignmentState {
  if (handedIn) {
    // A quiz of only choice questions is fully marked on submit, so it is just "submitted".
    if (kind === 'quiz' && needsReview) return 'review';
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

/** Single and multiple choice are marked automatically; the two paragraph types are written. */
export function isChoiceType(type: QuizQuestionType): type is 'single' | 'multiple' {
  return type === 'single' || type === 'multiple';
}

/**
 * The only rule on a quiz as a whole: it must have a question. (There is deliberately no
 * minimum above one, no maximum, and no required question type or order.) Per-question rules
 * live in choiceProblem and the builder schema.
 */
export function quizShapeProblems(types: QuizQuestionType[]): string[] {
  return types.length < QUIZ_MIN_QUESTIONS ? ['Add at least one question.'] : [];
}

/** True when any question is a Short/Long paragraph — i.e. needs a person to read the answer. */
export function hasWrittenQuestion(questions: Array<{ type: QuizQuestionType }>): boolean {
  return questions.some((question) => !isChoiceType(question.type));
}

/** Why a single/multiple choice question can't be saved yet, or null when it is fine. */
export function choiceProblem(
  type: QuizQuestionType,
  options: Array<{ isCorrect: boolean }>,
): string | null {
  if (!isChoiceType(type)) return null;
  if (options.length < MIN_OPTIONS) return `Add at least ${MIN_OPTIONS} options.`;

  const correct = options.filter((option) => option.isCorrect).length;
  if (correct === 0) {
    return type === 'single' ? 'Mark the correct answer.' : 'Mark at least one correct answer.';
  }
  if (type === 'single' && correct > 1) return 'Only one answer can be correct.';
  return null;
}

/** The stored-quiz form of the format check — also needs each choice question to have options. */
export function validateQuizShape(questions: QuizQuestion[]): string[] {
  const problems = quizShapeProblems(questions.map((question) => question.type));
  questions.forEach((question, index) => {
    if (isChoiceType(question.type) && question.options.length < MIN_OPTIONS) {
      problems.push(`Question ${index + 1} needs at least ${MIN_OPTIONS} options.`);
    }
  });
  return problems;
}

export function isQuestionAnswered(question: QuizQuestion, answers: QuizAnswersApiDto): boolean {
  if (!isChoiceType(question.type)) return (answers.texts[question.id] ?? '').trim().length > 0;
  return (answers.choices[question.id] ?? []).length > 0;
}

/** Multi-answer questions are all-or-nothing: the chosen set must match exactly. */
export function isChoiceCorrect(chosen: string[], correct: string[]): boolean {
  return chosen.length === correct.length && correct.every((id) => chosen.includes(id));
}

export function questionTypeLabel(type: QuizQuestion['type']): string {
  if (type === 'single') return 'Choose one answer';
  if (type === 'multiple') return 'Choose all that apply';
  if (type === 'short') return 'Short written answer';
  return 'Written answer';
}

/** A blank question for the builder — choice types start with two empty options. */
export function emptyQuestion(type: QuizQuestionType = 'single'): BuilderQuestionValues {
  return {
    type,
    prompt: '',
    options: isChoiceType(type)
      ? [
          { label: '', isCorrect: false },
          { label: '', isCorrect: false },
        ]
      : [],
  };
}

/** "1 question" / "8 questions". */
export function questionCountLabel(count: number): string {
  return count === 1 ? '1 question' : `${count} questions`;
}
