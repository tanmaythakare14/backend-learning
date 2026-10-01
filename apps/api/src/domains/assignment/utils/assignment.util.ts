import type { AssignmentKind } from '../entities/assignment.entity';
import type { QuizQuestionType } from '../entities/quiz-question.entity';
import type { AssignmentRowOutDto, AssignmentState, AssignmentTab } from '../dto/assignment.dto';

interface HandedIn {
  isLate: boolean;
}

export function deriveState(
  dueAt: Date,
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
  return dueAt.getTime() < now.getTime() ? 'overdue' : 'todo';
}

export function tabForState(state: AssignmentState): AssignmentTab {
  return state === 'late' || state === 'review' ? 'submitted' : state;
}

/** Multi-answer questions are all-or-nothing: the chosen set must match exactly. */
export function isChoiceCorrect(chosen: string[], correct: string[]): boolean {
  return chosen.length === correct.length && correct.every((id) => chosen.includes(id));
}

/** Correct answers are only shown once the due date has passed, so early finishers can't share them. */
export function isRevealed(dueAt: Date, now: Date = new Date()): boolean {
  return now.getTime() > dueAt.getTime();
}

export function percentage(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

/** Soonest deadline first for open work; most recent activity first for the rest. */
export function sortRows(
  rows: AssignmentRowOutDto[],
  tab: AssignmentTab | undefined,
): AssignmentRowOutDto[] {
  const byDueAsc = (a: AssignmentRowOutDto, b: AssignmentRowOutDto): number =>
    a.dueAt.getTime() - b.dueAt.getTime();

  if (tab === 'overdue') return [...rows].sort((a, b) => byDueAsc(b, a));
  if (tab === 'submitted') {
    return [...rows].sort(
      (a, b) => (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0),
    );
  }
  return [...rows].sort(byDueAsc);
}

/** Single and multiple choice are marked automatically; the two paragraph types are written. */
export function isChoiceType(type: QuizQuestionType): type is 'single' | 'multiple' {
  return type === 'single' || type === 'multiple';
}
