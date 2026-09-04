import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneNumberField } from '@/components/common/PhoneNumberField';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ApiError } from '@/utils/apiError';
import { COMPUTER_ENGINEERING_COURSES } from '../../constants';
import type { AddEditStudentDialogProps } from '../../@types';
import { studentFormSchema, type StudentFormSchemaValues } from './schema';

const EMPTY_VALUES: StudentFormSchemaValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  course: '',
};

export function AddEditStudentDialog({
  open,
  onOpenChange,
  student,
  onSubmit,
}: AddEditStudentDialogProps): JSX.Element {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<StudentFormSchemaValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      form.reset(
        student
          ? {
              firstName: student.firstName,
              lastName: student.lastName,
              email: student.email,
              phone: student.phone,
              course: student.course,
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, student, form]);

  const handleSubmit = async (values: StudentFormSchemaValues): Promise<void> => {
    setSubmitError(null);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        form.setError('email', { message: error.message });
        return;
      }
      setSubmitError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[580px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit student' : 'Add new student'}</DialogTitle>
          <DialogDescription>
            {student
              ? "Update this student's details."
              : 'Enroll a new student and assign a course.'}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-destructive">
            {submitError}
          </p>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      First name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ada" required disabled={!!student} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Last name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Lovelace" required disabled={!!student} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ada@example.com" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <PhoneNumberField required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Assigned course <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPUTER_ENGINEERING_COURSES.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? 'Saving…' : student ? 'Save changes' : 'Add student'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
