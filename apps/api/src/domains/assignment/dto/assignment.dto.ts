import type { AssignmentKind, AssignmentStatus } from '../entities/assignment.entity';
import type { QuizQuestionType } from '../entities/quiz-question.entity';
import type { QuizAnswers, ReviewStatus } from '../entities/quiz-attempt.entity';

/** Derived from the due date and what the student has handed in — never stored. */
export type AssignmentState = 'todo' | 'submitted' | 'late' | 'review' | 'overdue';

/** "late" and "review" live under the Submitted tab. */
export type AssignmentTab = 'todo' | 'submitted' | 'overdue';

export interface ListAssignmentsQuery {
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export interface SubmitWrittenDto {
  answerText: string;
}

export type SubmitQuizDto = QuizAnswers;

// ── Output ────────────────────────────────────────────────────────────────

/** One row of the table view. */
export interface AssignmentRowOutDto {
  id: string;
  kind: AssignmentKind;
  title: string;
  courseName: string;
  dueAt: Date;
  /** 0 for written assignments. */
  questionCount: number;
  state: AssignmentState;
  submittedAt: Date | null;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Tab badge counts — over the search results, before the status filter. */
export interface TabCounts {
  todo: number;
  submitted: number;
  overdue: number;
}

export interface QuizOptionOutDto {
  id: string;
  label: string;
}

/** A question as a student sees it — never carries the answer key. */
export interface QuizQuestionOutDto {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  /** Empty for descriptive questions. */
  options: QuizOptionOutDto[];
}

export interface SubmissionOutDto {
  id: string;
  answerText: string | null;
  fileName: string | null;
  fileSize: number | null;
  submittedAt: Date;
  isLate: boolean;
}

export interface QuizAttemptOutDto {
  id: string;
  answers: QuizAnswers;
  submittedAt: Date;
  isLate: boolean;
  /** Choice questions only — the descriptive answer is marked by hand. */
  choiceScore: { correct: number; total: number };
  reviewStatus: ReviewStatus;
  /** question id → correct option ids. Null until the due date has passed. */
  correctAnswers: Record<string, string[]> | null;
}

export interface AssignmentDetailOutDto {
  id: string;
  kind: AssignmentKind;
  title: string;
  courseName: string;
  instructions: string;
  dueAt: Date;
  state: AssignmentState;
  /** Written assignments only. */
  submission: SubmissionOutDto | null;
  /** Quizzes only — empty for written assignments. */
  questions: QuizQuestionOutDto[];
  quizAttempt: QuizAttemptOutDto | null;
}

export interface ScoreBreakdownItemOutDto {
  questionId: string;
  isCorrect: boolean;
  correctOptionIds: string[];
}

export interface ScoreOutDto {
  assignmentId: string;
  kind: AssignmentKind;
  submittedAt: Date;
  isLate: boolean;
  /** Written assignments are not scored, so this is null for them. */
  choiceScore: { correct: number; total: number; percentage: number } | null;
  /** Whether a person has marked the descriptive answer / written work yet. */
  reviewStatus: ReviewStatus;
  /** Per-question result. Null until the due date has passed. */
  breakdown: ScoreBreakdownItemOutDto[] | null;
}

// ── Create (admin) ────────────────────────────────────────────────────────

export interface CreateQuestionDto {
  type: QuizQuestionType;
  prompt: string;
  /** Only the two choice types carry options; they are dropped for the paragraph types. */
  options: Array<{ label: string; isCorrect: boolean }>;
}

export interface CreateAssignmentDto {
  kind: AssignmentKind;
  title: string;
  courseId: string;
  instructions: string;
  dueAt: Date;
  /** At least one for a quiz; none for a written assignment. */
  questions: CreateQuestionDto[];
}

export interface CreatedQuestionOutDto {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  /** Includes the answer key — this response goes to the person who just wrote it. */
  options: Array<{ id: string; label: string; isCorrect: boolean }>;
}

export interface CreatedAssignmentOutDto {
  id: string;
  kind: AssignmentKind;
  title: string;
  courseId: string;
  courseName: string;
  instructions: string;
  dueAt: Date;
  status: AssignmentStatus;
  createdAt: Date;
  questions: CreatedQuestionOutDto[];
}
