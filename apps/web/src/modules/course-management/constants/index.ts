import type { CourseStatus } from '../@types';

export const COURSE_LIST_PATH = '/courses';

export const COURSE_STATUS_TABS: { value: CourseStatus; label: string }[] = [
  { value: 'active', label: 'Active Courses' },
  { value: 'deactivated', label: 'Deactivated Courses' },
  { value: 'deleted', label: 'Deleted Courses' },
];

export const ALL_COURSE_STATUSES: CourseStatus[] = ['active', 'deactivated', 'deleted'];
