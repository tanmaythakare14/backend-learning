import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Power,
  Trash2,
  User,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ApiError } from '@/utils/apiError';
import { getInitials } from '@/utils/initials';
import { STUDENT_LIST_PATH } from '../../constants';
import type { Student, StudentStatus, StudentFormValues, ConfirmState } from '../../@types';
import { getConfirmActionCopy } from '../../utils';
import { AddEditStudentDialog } from '../student-form';
import {
  getStudent,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  apiDtoToStudent,
  formValuesToUpdatePayload,
} from '../../service';

const STATUS_LABEL: Record<StudentStatus, string> = {
  active: 'Active',
  deactivated: 'Deactivated',
  deleted: 'Deleted',
};

const STATUS_BADGE_VARIANT: Record<StudentStatus, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  deactivated: 'secondary',
  deleted: 'destructive',
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; student: Student };

function DetailField({ label, value }: { label: string; value: ReactNode }): JSX.Element {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function DetailFieldGrid({ children }: { children: ReactNode }): JSX.Element {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

export function StudentDetailScreen(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stateStudent = (location.state as { student?: Student } | null)?.student;

  const [loadState, setLoadState] = useState<LoadState>(
    stateStudent ? { status: 'success', student: stateStudent } : { status: 'loading' },
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  // Row navigation seeds an instant render from router state, but always
  // refetches in the background — the browser keeps history.state across a
  // hard reload, so trusting it alone would keep showing pre-mutation data
  // (e.g. a status from before a deactivate/delete) forever after a refresh.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getStudent(id)
      .then((dto) => {
        if (cancelled) return;
        setLoadState({ status: 'success', student: apiDtoToStudent(dto) });
      })
      .catch((error) => {
        if (cancelled) return;
        // A failed background refresh shouldn't blow away data we already have.
        setLoadState((prev) =>
          prev.status === 'success'
            ? prev
            : {
                status: 'error',
                message: error instanceof ApiError ? error.message : 'Failed to load student.',
              },
        );
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleFormSubmit = async (values: StudentFormValues): Promise<void> => {
    if (loadState.status !== 'success') return;
    const updated = await updateStudent(loadState.student.id, formValuesToUpdatePayload(values));
    setLoadState({
      status: 'success',
      // Preserve fields the update API doesn't return (e.g. address, previousCourses).
      student: { ...loadState.student, ...apiDtoToStudent(updated) },
    });
    toast.success('Student updated');
  };

  // Delete sends the user back to the list since there's nothing left here to
  // show; activate/deactivate stays on the page with the updated status.
  const handleConfirm = async (): Promise<void> => {
    if (!confirmState || loadState.status !== 'success') return;
    const { type, student: target } = confirmState;

    if (type === 'delete') {
      await deleteStudent(target.id);
      toast.success('Student deleted');
      navigate(STUDENT_LIST_PATH);
      return;
    }

    const nextStatus: StudentStatus = type === 'activate' ? 'active' : 'deactivated';
    const updated = await updateStudentStatus(target.id, nextStatus);
    setLoadState({
      status: 'success',
      student: { ...loadState.student, ...apiDtoToStudent(updated) },
    });
    toast.success(type === 'activate' ? 'Student activated' : 'Student deactivated');
  };

  const student = loadState.status === 'success' ? loadState.student : undefined;
  const address = student?.address;
  const previousCourses = student?.previousCourses ?? [];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to={STUDENT_LIST_PATH} className="hover:text-foreground hover:underline">
          Student Management
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">
          {student ? `${student.firstName} ${student.lastName}` : 'Student details'}
        </span>
      </nav>

      {loadState.status === 'loading' && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading student…
        </div>
      )}

      {loadState.status === 'error' && (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadState.message}
        </p>
      )}

      {student && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-primary">
                {getInitials(`${student.firstName} ${student.lastName}`)}
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {student.firstName} {student.lastName}
                </h1>
                <Badge variant={STATUS_BADGE_VARIANT[student.status]}>
                  {STATUS_LABEL[student.status]}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setIsFormOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  setConfirmState({
                    type: student.status === 'deactivated' ? 'activate' : 'deactivate',
                    student,
                  })
                }
              >
                <Power className="h-4 w-4" />
                {student.status === 'deactivated' ? 'Activate' : 'Deactivate'}
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setConfirmState({ type: 'delete', student })}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DetailSection title="Basic Details" icon={User}>
              <DetailFieldGrid>
                <DetailField label="Student ID" value={student.studentId} />
                <DetailField label="Full Name" value={`${student.firstName} ${student.lastName}`} />
                <DetailField label="Status" value={STATUS_LABEL[student.status]} />
              </DetailFieldGrid>
            </DetailSection>

            <DetailSection title="Professional Details" icon={GraduationCap}>
              <DetailFieldGrid>
                <DetailField label="Assigned Course" value={student.course} />
                <DetailField
                  label="Enrolled On"
                  value={format(new Date(student.assignedOn), 'MM/dd/yyyy')}
                />
                <DetailField label="Courses Completed" value={String(previousCourses.length)} />
              </DetailFieldGrid>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Previous Courses
                </p>
                {previousCourses.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previousCourses.map((courseName) => (
                      <Badge key={courseName} variant="secondary" className="gap-1.5">
                        <BookOpen className="h-3 w-3" />
                        {courseName}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    No previous courses on record yet.
                  </p>
                )}
              </div>
            </DetailSection>

            <DetailSection title="Contact Details" icon={Phone}>
              <DetailFieldGrid>
                <DetailField label="Email Address" value={student.email} />
                <DetailField label="Phone Number" value={student.phone} />
              </DetailFieldGrid>
            </DetailSection>

            <DetailSection title="Address Details" icon={MapPin}>
              <DetailFieldGrid>
                <DetailField label="Street Address" value={address?.street ?? '—'} />
                <DetailField label="City" value={address?.city ?? '—'} />
                <DetailField label="State" value={address?.state ?? '—'} />
                <DetailField label="ZIP Code" value={address?.zipCode ?? '—'} />
                <DetailField label="Country" value={address?.country ?? '—'} />
              </DetailFieldGrid>
            </DetailSection>
          </div>
        </>
      )}

      <AddEditStudentDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={student}
        onSubmit={handleFormSubmit}
      />

      {confirmState && (
        <ConfirmDialog
          open={!!confirmState}
          onOpenChange={(open) => !open && setConfirmState(null)}
          onConfirm={handleConfirm}
          {...getConfirmActionCopy(confirmState)}
        />
      )}
    </div>
  );
}
