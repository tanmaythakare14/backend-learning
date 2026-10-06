/** Derived from the due date and submission — never stored. */
export type AssignmentState = 'todo' | 'submitted' | 'late' | 'review' | 'overdue';

/** "late" and "review" live under the Submitted tab. */
export type AssignmentTab = 'todo' | 'submitted' | 'overdue';

export type AssignmentKind = 'written' | 'quiz';

export type QuizQuestionType = 'single' | 'multiple' | 'short' | 'descriptive';

// DTOs — raw shapes from the API. Correct answers are never part of a question.
export interface QuizOptionApiDto {
  id: string;
  label: string;
}

export interface QuizQuestionApiDto {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  /** Empty for descriptive questions. */
  options: QuizOptionApiDto[];
}

export interface QuizAnswersApiDto {
  /** question id → chosen option ids */
  choices: Record<string, string[]>;
  /** question id → written answer */
  texts: Record<string, string>;
}

export interface QuizAttemptApiDto {
  id: string;
  answers: QuizAnswersApiDto;
  submittedAt: string;
  isLate: boolean;
  /** Choice questions only — the descriptive answer is marked by hand. */
  choiceScore: { correct: number; total: number };
  reviewStatus: 'pending' | 'graded';
  /** question id → correct option ids. Null until the due date has passed. */
  correctAnswers: Record<string, string[]> | null;
}

export interface SubmissionApiDto {
  id: string;
  answerText: string | null;
  fileName: string | null;
  fileSize: number | null;
  submittedAt: string;
  isLate: boolean;
}

export interface AssignmentApiDto {
  id: string;
  kind: AssignmentKind;
  title: string;
  courseName: string;
  instructions: string;
  dueAt: string;
  /** Written assignments only. */
  submission: SubmissionApiDto | null;
  /** Quizzes only — empty for written assignments. */
  questions: QuizQuestionApiDto[];
  quizAttempt: QuizAttemptApiDto | null;
}

// Domain shapes — used through the UI once mapped from the DTOs
export type QuizOption = QuizOptionApiDto;
export type QuizQuestion = QuizQuestionApiDto;
export type QuizAttempt = QuizAttemptApiDto;

export interface Submission {
  id: string;
  answerText: string | null;
  fileName: string | null;
  fileSize: number | null;
  submittedAt: string;
  isLate: boolean;
}

export interface Assignment {
  id: string;
  kind: AssignmentKind;
  title: string;
  courseName: string;
  instructions: string;
  dueAt: string;
  submission: Submission | null;
  questions: QuizQuestion[];
  quizAttempt: QuizAttempt | null;
  /** When the work was handed in, whichever kind it is. */
  submittedAt: string | null;
  state: AssignmentState;
}

export interface SubmitAssignmentPayload {
  answerText: string;
  file: File | null;
}

export type SubmitQuizPayload = QuizAnswersApiDto;

// Admin: creating an assignment
export interface CourseOptionApiDto {
  id: string;
  name: string;
}

export type CourseOption = CourseOptionApiDto;

/** FormView — the shape the builder form edits, before it is mapped to a payload. */
export interface BuilderOptionValues {
  label: string;
  isCorrect: boolean;
}

export interface BuilderQuestionValues {
  type: QuizQuestionType;
  prompt: string;
  /** Used only by the two choice types; empty otherwise. */
  options: BuilderOptionValues[];
}

export interface AssignmentBuilderValues {
  title: string;
  courseId: string;
  instructions: string;
  /** A datetime-local string, e.g. "2026-10-05T17:00". */
  dueAt: string;
  questions: BuilderQuestionValues[];
}

export interface CreateQuestionPayload {
  type: QuizQuestionType;
  prompt: string;
  /** Empty for the two paragraph types. */
  options: Array<{ label: string; isCorrect: boolean }>;
}

export interface CreateAssignmentPayload {
  title: string;
  courseId: string;
  /** Denormalised for the mock — a real API would look the name up from courseId. */
  courseName: string;
  instructions: string;
  /** ISO timestamp. */
  dueAt: string;
  questions: CreateQuestionPayload[];
}

export type CourseListState =
  | { status: 'loading' }
  | { status: 'error'; message: string; sessionExpired: boolean }
  | { status: 'success'; courses: CourseOption[] };

// Screen load state
export type AssignmentListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; assignments: Assignment[] };

export type AssignmentDetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; assignment: Assignment };

// Component props
export interface AssignmentStatusBadgeProps {
  state: AssignmentState;
}

export interface AssignmentRowProps {
  assignment: Assignment;
}

export interface SubmissionFormProps {
  hasSubmission: boolean;
  isPastDue: boolean;
  onSubmit: (payload: SubmitAssignmentPayload) => Promise<void>;
}

export interface QuizRunnerProps {
  questions: QuizQuestion[];
  isPastDue: boolean;
  onSubmit: (payload: SubmitQuizPayload) => Promise<void>;
}

export interface ChoiceQuestionProps {
  question: QuizQuestion;
  selected: string[];
  onChange: (optionIds: string[]) => void;
}

export interface DescriptiveQuestionProps {
  question: QuizQuestion;
  value: string;
  onChange: (text: string) => void;
}

export interface QuestionEditorProps {
  index: number;
  /** Total questions, so the first/last can disable their move button. */
  total: number;
  onDuplicate: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onRemove: () => void;
}

export interface QuizOutlineProps {
  /** Scroll to, and focus, the question card at this index. */
  onJump: (index: number) => void;
}

export interface OptionsEditorProps {
  questionIndex: number;
  type: 'single' | 'multiple';
}

export interface QuizNavigatorProps {
  total: number;
  current: number;
  isAnswered: (index: number) => boolean;
  onGoTo: (index: number) => void;
}

export interface QuizReviewProps {
  questions: QuizQuestion[];
  isAnswered: (index: number) => boolean;
  isPastDue: boolean;
  isSubmitting: boolean;
  onGoTo: (index: number) => void;
  onSubmitClick: () => void;
}

export interface QuizResultProps {
  questions: QuizQuestion[];
  attempt: QuizAttempt;
}
