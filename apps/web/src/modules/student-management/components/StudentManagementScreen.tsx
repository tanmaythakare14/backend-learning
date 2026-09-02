import { useState } from 'react';
import type { JSX } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { STUDENT_STATUS_TABS, MOCK_STUDENTS } from '../constants';
import { generateNextStudentId } from '../utils';
import type { Student, StudentStatus, StudentFormValues } from '../@types';
import { StudentTable } from './student-table';
import { CourseFilterPopover } from './course-filter';
import { AddEditStudentDialog } from './student-form';

interface ConfirmState {
  type: 'activate' | 'deactivate' | 'delete';
  student: Student;
}

export function StudentManagementScreen(): JSX.Element {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [activeTab, setActiveTab] = useState<StudentStatus>('active');
  const [search, setSearch] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const countByStatus = (status: StudentStatus): number =>
    students.filter((s) => s.status === status).length;

  const visibleStudents = students.filter((student) => {
    if (student.status !== activeTab) return false;
    if (selectedCourses.length > 0 && !selectedCourses.includes(student.course)) return false;
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      if (!fullName.includes(query) && !student.email.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const handleAddNew = (): void => {
    setEditingStudent(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (student: Student): void => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: StudentFormValues): void => {
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...s, ...values } : s)),
      );
      toast.success('Student updated');
    } else {
      const newStudent: Student = {
        id: crypto.randomUUID(),
        studentId: generateNextStudentId(students),
        ...values,
        assignedOn: new Date().toISOString(),
        status: 'active',
      };
      setStudents((prev) => [newStudent, ...prev]);
      toast.success('Student added');
    }
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

  const handleConfirm = (): void => {
    if (!confirmState) return;
    const { type, student } = confirmState;
    const nextStatus: StudentStatus =
      type === 'delete' ? 'deleted' : type === 'activate' ? 'active' : 'deactivated';
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s)),
    );
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

        {STUDENT_STATUS_TABS.map((tab) => (
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
        ))}
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
