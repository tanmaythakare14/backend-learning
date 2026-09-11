export type StudentStatus = 'active' | 'deactivated' | 'deleted';

export interface StudentAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

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
  address: StudentAddress;
  /** Not returned by the API yet — always undefined until the backend tracks it. */
  previousCourses?: string[];
}

export interface StudentFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  street: string;
  /** ISO country code (e.g. "US") — the Combobox's internal value, converted to a full name before hitting the API. */
  country: string;
  /** ISO state code, scoped to the selected country. */
  state: string;
  city: string;
  zipCode: string;
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
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
}

export interface CreateStudentPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/** Deliberately excludes firstName/lastName — matches the backend, which rejects them entirely. */
export interface UpdateStudentPayload {
  email: string;
  phone: string;
  course: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
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

export type ConfirmActionType = 'activate' | 'deactivate' | 'delete';

export interface ConfirmState {
  type: ConfirmActionType;
  student: Student;
}
