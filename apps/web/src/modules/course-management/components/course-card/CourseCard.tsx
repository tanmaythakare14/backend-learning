import type { JSX } from 'react';
import { format } from 'date-fns';
import { CalendarDays, MoreHorizontal, Pencil, Power, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CourseCardProps, CourseStatus } from '../../@types';

const STATUS_LABEL: Record<CourseStatus, string> = {
  active: 'Active',
  deactivated: 'Deactivated',
  deleted: 'Deleted',
};

const STATUS_BADGE_VARIANT: Record<CourseStatus, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  deactivated: 'secondary',
  deleted: 'destructive',
};

export function CourseCard({
  course,
  onEdit,
  onDeactivate,
  onDelete,
}: CourseCardProps): JSX.Element {
  const isDeactivated = course.status === 'deactivated';

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-glow-sm">
      <img
        src={course.thumbnailUrl}
        alt={course.name}
        className="aspect-video w-full object-cover"
      />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="min-w-0 truncate text-sm font-semibold text-foreground">
              {course.name}
            </h3>
            <Badge variant={STATUS_BADGE_VARIANT[course.status]} className="shrink-0">
              {STATUS_LABEL[course.status]}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label={`Actions for ${course.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-primary data-[popup-open]:bg-accent-soft data-[popup-open]:text-primary"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(course)}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeactivate(course)}>
                <Power className="h-4 w-4" />
                {isDeactivated ? 'Activate' : 'Deactivate'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={() => onDelete(course)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{course.description}</p>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Enrolled on {format(new Date(course.enrolledOn), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {course.totalLearners} learners
          </span>
        </div>
      </div>
    </div>
  );
}
