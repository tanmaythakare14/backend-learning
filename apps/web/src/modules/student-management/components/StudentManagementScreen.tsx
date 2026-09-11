import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ApiError } from '@/utils/apiError';
import { ALL_STUDENT_STATUSES, STUDENT_STATUS_TABS } from '../constants';
import type { Student, StudentStatus, StudentFormValues } from '../@types';
import { StudentTable } from './student-table';
import { CourseFilterPopover } from './course-filter';
import { AddEditStudentDialog } from './student-form';
import {
  listStudents,
  createStudent,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  apiDtoToStudent,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
} from '../service';

type ByStatus = Record<StudentStatus, Student[]>;

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; byStatus: ByStatus };

export function StudentManagementScreen(): JSX.Element {
  const [activeTab, setActiveTab] = useState<StudentStatus>('active');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
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
      ALL_STUDENT_STATUSES.map((status) =>
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

  const handleDeactivateToggle = async (student: Student): Promise<void> => {
    const nextStatus: StudentStatus = student.status === 'deactivated' ? 'active' : 'deactivated';
    try {
      await updateStudentStatus(student.id, nextStatus);
      toast.success(nextStatus === 'active' ? 'Student activated' : 'Student deactivated');
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  const handleDelete = async (student: Student): Promise<void> => {
    try {
      await deleteStudent(student.id);
      toast.success('Student deleted');
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
    }
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
            <Button onClick={handleAddNew} className="h-10 gap-2">
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
                  onDeactivate={handleDeactivateToggle}
                  onDelete={handleDelete}
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
    </div>
  );
}
