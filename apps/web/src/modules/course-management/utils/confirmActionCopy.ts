import type { ConfirmState } from '../@types';

export interface ConfirmActionCopy {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
}

export function getConfirmActionCopy({ type, course }: ConfirmState): ConfirmActionCopy {
  switch (type) {
    case 'activate':
      return {
        title: 'Activate course?',
        description: `"${course.name}" will be visible again under Active Courses.`,
        confirmLabel: 'Activate',
      };
    case 'deactivate':
      return {
        title: 'Deactivate course?',
        description: `"${course.name}" will move to Deactivated Courses and stay hidden from learners.`,
        confirmLabel: 'Deactivate',
      };
    case 'delete':
      return {
        title: 'Delete course?',
        description: `"${course.name}" will move to Deleted Courses. This won't affect existing learner records.`,
        confirmLabel: 'Delete',
        destructive: true,
      };
  }
}
