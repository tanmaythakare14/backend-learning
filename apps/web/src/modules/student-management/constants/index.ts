import type { StudentStatus } from '../@types';

export const STUDENT_STATUS_TABS: Array<{ value: StudentStatus; label: string }> = [
  { value: 'active', label: 'Active Students' },
  { value: 'deactivated', label: 'Deactivated Students' },
  { value: 'deleted', label: 'Deleted Students' },
];

export const ALL_STUDENT_STATUSES: StudentStatus[] = ['active', 'deactivated', 'deleted'];

export const STUDENT_LIST_PATH = '/students';
