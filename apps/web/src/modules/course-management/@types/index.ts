export type CourseStatus = 'active' | 'deactivated' | 'deleted';

// Domain type used by the UI
export interface Course {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  /** When the course was created/opened for enrollment — system-set, not form-editable. */
  enrolledOn: string;
  /** System-tracked enrollment count — not form-editable. */
  totalLearners: number;
  status: CourseStatus;
}

/** Raw shape from the API. */
export interface CourseApiDto {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  enrolledOn: string;
  totalLearners: number;
  status: CourseStatus;
}

// FormView — only the fields an admin actually edits
export interface CourseFormValues {
  name: string;
  description: string;
  thumbnailUrl: string;
}

export interface CreateCoursePayload {
  name: string;
  description: string;
  thumbnailUrl: string;
}

export interface UpdateCoursePayload {
  name: string;
  description: string;
  thumbnailUrl: string;
}

// Component props
export interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDeactivate: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export interface AddEditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course;
  onSubmit: (values: CourseFormValues) => Promise<void>;
}

export type ConfirmActionType = 'activate' | 'deactivate' | 'delete';

export interface ConfirmState {
  type: ConfirmActionType;
  course: Course;
}
