import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SearchInput } from '@/components/common/SearchInput';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ApiError } from '@/utils/apiError';
import { ALL_COURSE_STATUSES, COURSE_STATUS_TABS } from '../constants';
import type { Course, CourseFormValues, CourseStatus, ConfirmState } from '../@types';
import { getConfirmActionCopy } from '../utils';
import { CourseCard } from './course-card';
import { AddEditCourseDialog } from './course-form';
import {
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
  listCourses,
  apiDtoToCourse,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
} from '../service';

type ByStatus = Record<CourseStatus, Course[]>;

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; byStatus: ByStatus };

export function CourseManagementScreen(): JSX.Element {
  const [activeTab, setActiveTab] = useState<CourseStatus>('active');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadState({ status: 'loading' });

    Promise.all(
      ALL_COURSE_STATUSES.map((status) =>
        listCourses(status).then((dtos) => [status, dtos.map(apiDtoToCourse)] as const),
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
          message: error instanceof ApiError ? error.message : 'Failed to load courses.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const countByStatus = (status: CourseStatus): number =>
    loadState.status === 'success' ? loadState.byStatus[status].length : 0;

  const coursesForTab = (status: CourseStatus): Course[] =>
    (loadState.status === 'success' ? loadState.byStatus[status] : []).filter((course) =>
      course.name.toLowerCase().includes(search.trim().toLowerCase()),
    );

  const handleAddNew = (): void => {
    setEditingCourse(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (course: Course): void => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: CourseFormValues): Promise<void> => {
    if (editingCourse) {
      await updateCourse(editingCourse.id, formValuesToUpdatePayload(values));
      toast.success('Course updated');
    } else {
      await createCourse(formValuesToCreatePayload(values));
      toast.success('Course added');
    }
    setRefreshKey((key) => key + 1);
  };

  const handleDeactivateRequest = (course: Course): void => {
    setConfirmState({
      type: course.status === 'deactivated' ? 'activate' : 'deactivate',
      course,
    });
  };

  const handleDeleteRequest = (course: Course): void => {
    setConfirmState({ type: 'delete', course });
  };

  const handleConfirm = async (): Promise<void> => {
    if (!confirmState) return;
    const { type, course } = confirmState;

    if (type === 'delete') {
      await deleteCourse(course.id);
      toast.success('Course deleted');
    } else {
      await updateCourseStatus(course.id, type === 'activate' ? 'active' : 'deactivated');
      toast.success(type === 'activate' ? 'Course activated' : 'Course deactivated');
    }

    setRefreshKey((key) => key + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Course Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View, create, and manage every course offered to students.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CourseStatus)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            {COURSE_STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}{' '}
                <span className="ml-1 text-muted-foreground">({countByStatus(tab.value)})</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by name"
              containerClassName="w-72"
            />
            <Button onClick={handleAddNew} className="h-10 gap-2">
              <Plus className="h-4 w-4" />
              Add New Course
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
            Loading courses…
          </div>
        ) : (
          COURSE_STATUS_TABS.map((tab) => {
            const tabCourses = coursesForTab(tab.value);
            return (
              <TabsContent key={tab.value} value={tab.value}>
                {tabCourses.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
                    No {tab.label.toLowerCase()} yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {tabCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onEdit={handleEdit}
                        onDeactivate={handleDeactivateRequest}
                        onDelete={handleDeleteRequest}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })
        )}
      </Tabs>

      <AddEditCourseDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        course={editingCourse}
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
