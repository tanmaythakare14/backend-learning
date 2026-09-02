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
  onSubmit: (values: StudentFormValues) => void;
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
