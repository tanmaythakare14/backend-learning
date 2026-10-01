/** Derived from the due date and submission — never stored. */
export type AssignmentState = 'todo' | 'submitted' | 'late' | 'review' | 'overdue';

/** "late" and "review" live under the Submitted tab. */
export type AssignmentTab = 'todo' | 'submitted' | 'overdue';

export type AssignmentKind = 'written' | 'quiz';

export type QuizQuestionType = 'single' | 'multiple' | 'descriptive';

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
