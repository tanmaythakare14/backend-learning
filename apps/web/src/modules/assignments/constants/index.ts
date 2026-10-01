import type { AssignmentState, AssignmentTab } from '../@types';

export const ASSIGNMENTS_PATH = '/assignments';

export const ASSIGNMENT_TABS: Array<{ value: AssignmentTab; label: string; emptyMessage: string }> =
  [
    { value: 'todo', label: 'To do', emptyMessage: "Nothing due — you're all caught up." },
    { value: 'submitted', label: 'Submitted', emptyMessage: "You haven't submitted anything yet." },
    { value: 'overdue', label: 'Overdue', emptyMessage: 'No overdue assignments.' },
  ];

export const ASSIGNMENT_STATE_LABELS: Record<AssignmentState, string> = {
  todo: 'To do',
  submitted: 'Submitted',
  late: 'Submitted late',
  review: 'Pending review',
  overdue: 'Overdue',
};

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_ANSWER_LENGTH = 5000;
export const ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
export const FILE_ACCEPT = ALLOWED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',');

/** A quiz has 7–8 questions: choice questions first, then exactly one descriptive one. */
export const QUIZ_MIN_QUESTIONS = 7;
export const QUIZ_MAX_QUESTIONS = 8;
export const MAX_DESCRIPTIVE_LENGTH = 3000;
