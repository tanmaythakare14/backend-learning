import type { ConfirmState } from '../@types';

export interface ConfirmActionCopy {
  title: string;
  description: string;
  confirmLabel: string;
  destructive: boolean;
}

export function getConfirmActionCopy({ type, student }: ConfirmState): ConfirmActionCopy {
  const name = `${student.firstName} ${student.lastName}`;

  if (type === 'delete') {
    return {
      title: 'Delete student?',
      description: `This will delete ${name}'s record.`,
      confirmLabel: 'Delete',
      destructive: true,
    };
  }

  if (type === 'activate') {
    return {
      title: 'Activate student?',
      description: `This will activate ${name}'s record.`,
      confirmLabel: 'Activate',
      destructive: false,
    };
  }

  return {
    title: 'Deactivate student?',
    description: `This will deactivate ${name}'s record.`,
    confirmLabel: 'Deactivate',
    destructive: false,
  };
}
