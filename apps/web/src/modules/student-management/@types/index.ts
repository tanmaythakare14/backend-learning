export type StudentStatus = 'active' | 'deactivated' | 'deleted';

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  assignedOn: string; // ISO date string
  status: StudentStatus;
}

export interface StudentFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
}

export interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDeactivate: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export interface CourseFilterPopoverProps {
  selectedCourses: string[];
  onChange: (courses: string[]) => void;
}

export interface AddEditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student;
  onSubmit: (values: StudentFormValues) => Promise<void>;
}

/** Raw shape from the API — includes createdAt, which the UI never needs (see mapper.ts). */
export interface StudentApiDto {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  status: StudentStatus;
  assignedOn: string;
  createdAt: string;
}

export interface CreateStudentPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
}

/** Deliberately excludes firstName/lastName — matches the backend, which rejects them entirely. */
export interface UpdateStudentPayload {
  email: string;
  phone: string;
  course: string;
}

export interface ListStudentsParams {
  status: StudentStatus;
  course?: string[];
  search?: string;
}

export interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}
