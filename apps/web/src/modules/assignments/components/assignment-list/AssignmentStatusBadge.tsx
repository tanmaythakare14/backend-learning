import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';
import { ASSIGNMENT_STATE_LABELS } from '../../constants';
import type { AssignmentState, AssignmentStatusBadgeProps } from '../../@types';

const VARIANT_BY_STATE: Record<
  AssignmentState,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  todo: 'outline',
  submitted: 'default',
  late: 'secondary',
  review: 'secondary',
  overdue: 'destructive',
};

export function AssignmentStatusBadge({ state }: AssignmentStatusBadgeProps): JSX.Element {
  return <Badge variant={VARIANT_BY_STATE[state]}>{ASSIGNMENT_STATE_LABELS[state]}</Badge>;
}
