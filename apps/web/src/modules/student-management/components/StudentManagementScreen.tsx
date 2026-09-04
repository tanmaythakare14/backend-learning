import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ApiError } from '@/utils/apiError';
import { STUDENT_STATUS_TABS } from '../constants';
import type { Student, StudentStatus, StudentFormValues } from '../@types';
import { StudentTable } from './student-table';
import { CourseFilterPopover } from './course-filter';
import { AddEditStudentDialog } from './student-form';
import {
  listStudents,
  createStudent,
  updateStudent,
  apiDtoToStudent,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
} from '../service';

const ALL_STATUSES: StudentStatus[] = ['active', 'deactivated', 'deleted'];

type ByStatus = Record<StudentStatus, Student[]>;

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; byStatus: ByStatus };

interface ConfirmState {
  type: 'activate' | 'deactivate' | 'delete';
  student: Student;
}

export function StudentManagementScreen(): JSX.Element {
  const [activeTab, setActiveTab] = useState<StudentStatus>('active');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search so it doesn't refetch on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // Fetch all three statuses in parallel (same course/search filters) so tab
  // counts stay accurate and switching tabs doesn't need a network round trip.
  useEffect(() => {
    let cancelled = false;
    setLoadState({ status: 'loading' });

    Promise.all(
      ALL_STATUSES.map((status) =>
        listStudents({ status, course: selectedCourses, search: debouncedSearch }).then(
          (dtos) => [status, dtos.map(apiDtoToStudent)] as const,
        ),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        const byStatus = Object.fromEntries(results) as ByStatus;
        setLoadState({ status: 'success', byStatus });
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadState({
          status: 'error',
          message: error instanceof ApiError ? error.message : 'Failed to load students.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCourses, debouncedSearch, refreshKey]);

  const countByStatus = (status: StudentStatus): number =>
    loadState.status === 'success' ? loadState.byStatus[status].length : 0;

  const visibleStudents = loadState.status === 'success' ? loadState.byStatus[activeTab] : [];

  const handleAddNew = (): void => {
    setEditingStudent(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (student: Student): void => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: StudentFormValues): Promise<void> => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, formValuesToUpdatePayload(values));
      toast.success('Student updated');
    } else {
      await createStudent(formValuesToCreatePayload(values));
      toast.success('Student added');
    }
    setRefreshKey((key) => key + 1);
  };

  const handleDeactivateRequest = (student: Student): void => {
    setConfirmState({
      type: student.status === 'deactivated' ? 'activate' : 'deactivate',
      student,
    });
  };

  const handleDeleteRequest = (student: Student): void => {
    setConfirmState({ type: 'delete', student });
  };

  // MOCK:API — no deactivate/delete endpoint exists on the backend yet, so
  // this only moves the student between the locally-cached status lists.
  // It will be overwritten by the next real refetch (e.g. after create/edit).
  const handleConfirm = (): void => {
    if (!confirmState || loadState.status !== 'success') return;
    const { type, student } = confirmState;
    const nextStatus: StudentStatus =
      type === 'delete' ? 'deleted' : type === 'activate' ? 'active' : 'deactivated';

    setLoadState({
      status: 'success',
      byStatus: {
        ...loadState.byStatus,
        [student.status]: loadState.byStatus[student.status].filter((s) => s.id !== student.id),
        [nextStatus]: [{ ...student, status: nextStatus }, ...loadState.byStatus[nextStatus]],
      },
    });

    toast.success(
      type === 'delete'
        ? 'Student deleted'
        : type === 'activate'
          ? 'Student activated'
          : 'Student deactivated',
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Student Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View, enroll, and manage every student across your programs.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as StudentStatus)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            {STUDENT_STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}{' '}
                <span className="ml-1 text-muted-foreground">({countByStatus(tab.value)})</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-3">
            <CourseFilterPopover selectedCourses={selectedCourses} onChange={setSelectedCourses} />
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student name and email address"
                className="h-10 w-72 pl-9"
              />
            </div>
            <Button onClick={handleAddNew} className="gap-2 rounded-full">
              <UserPlus className="h-4 w-4" />
              Add New Student
            </Button>
          </div>
        </div>

        {loadState.status === 'error' ? (
          <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadState.message}
          </p>
        ) : loadState.status === 'loading' ? (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading students…
          </div>
        ) : (
          STUDENT_STATUS_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="rounded-xl border border-border bg-card">
                <StudentTable
                  students={visibleStudents}
                  onEdit={handleEdit}
                  onDeactivate={handleDeactivateRequest}
                  onDelete={handleDeleteRequest}
                />
              </div>
            </TabsContent>
          ))
        )}
      </Tabs>

      <AddEditStudentDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={editingStudent}
        onSubmit={handleFormSubmit}
      />

      {confirmState && (
        <ConfirmDialog
          open={!!confirmState}
          onOpenChange={(open) => !open && setConfirmState(null)}
          title={
            confirmState.type === 'delete'
              ? 'Delete student?'
              : confirmState.type === 'activate'
                ? 'Activate student?'
                : 'Deactivate student?'
          }
          description={`This will ${confirmState.type} ${confirmState.student.firstName} ${confirmState.student.lastName}'s record.`}
          confirmLabel={
            confirmState.type === 'delete'
              ? 'Delete'
              : confirmState.type === 'activate'
                ? 'Activate'
                : 'Deactivate'
          }
          destructive={confirmState.type === 'delete'}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
