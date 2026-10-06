import { useEffect, useMemo, useState } from 'react';
import type { JSX, KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startOfToday } from 'date-fns';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/utils/apiError';
import { notifySessionExpired } from '@/utils/authToken';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/common/date-time-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ASSIGNMENTS_PATH, QUESTION_TYPE_OPTIONS } from '../../constants';
import { builderValuesToCreatePayload, createAssignment, listCourseOptions } from '../../service';
import { emptyQuestion } from '../../utils';
import type { CourseListState } from '../../@types';
import { assignmentBuilderSchema, type AssignmentBuilderSchemaValues } from './schema';
import { QuestionEditor } from './QuestionEditor';
import { QuizOutline } from './QuizOutline';
import { QUESTION_TYPE_ICONS } from './questionTypeIcons';

const DEFAULT_VALUES: AssignmentBuilderSchemaValues = {
  title: '',
  instructions: '',
  courseId: '',
  dueAt: '',
  questions: [emptyQuestion('single')],
};

/** Admin: build and publish a new quiz. */
export function AssignmentBuilderScreen(): JSX.Element {
  const navigate = useNavigate();
  const [courseState, setCourseState] = useState<CourseListState>({ status: 'loading' });
  const [courseReloadKey, setCourseReloadKey] = useState(0);
  const today = useMemo(() => startOfToday(), []);

  const form = useForm<AssignmentBuilderSchemaValues>({
    resolver: zodResolver(assignmentBuilderSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { fields, append, insert, move, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  useEffect(() => {
    let cancelled = false;
    setCourseState({ status: 'loading' });

    listCourseOptions()
      .then((courses) => {
        if (!cancelled) setCourseState({ status: 'success', courses });
      })
      .catch((error: unknown) => {
        logger.error('Could not load courses', error);
        if (cancelled) return;
        setCourseState({
          status: 'error',
          message: error instanceof ApiError ? error.message : 'Could not load your courses.',
          sessionExpired: error instanceof ApiError && error.status === 401,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [courseReloadKey]);

  // Only the chosen course is needed here — watching more would re-render on every keystroke.
  const courseId = useWatch({ control: form.control, name: 'courseId' });
  const selectedCourse =
    courseState.status === 'success'
      ? courseState.courses.find((course) => course.id === courseId)
      : undefined;

  const handlePublish = async (values: AssignmentBuilderSchemaValues): Promise<void> => {
    if (!selectedCourse) {
      form.setError('courseId', { message: 'Choose a course' });
      return;
    }

    try {
      await createAssignment(builderValuesToCreatePayload(values, selectedCourse));
      toast.success('Assignment published');
      navigate(ASSIGNMENTS_PATH);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  const handleInvalid = (): void => {
    toast.error('Fix the highlighted problems before publishing.');
  };

  const handleMove = (index: number, direction: 'up' | 'down'): void => {
    move(index, direction === 'up' ? index - 1 : index + 1);
  };

  const handleDuplicate = (index: number): void => {
    insert(index + 1, structuredClone(form.getValues(`questions.${index}`)));
  };

  const handleJump = (index: number): void => {
    const card = document.getElementById(`question-${index}`);
    if (!card) return;

    // Scroll only the content area. scrollIntoView() scrolls every ancestor, including
    // the app shell (overflow-hidden, but still scrollable by script), which would drag
    // the sidebar and top bar out of view.
    const scroller = card.closest('main');
    if (scroller) {
      const offset = card.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      const centred = (scroller.clientHeight - card.offsetHeight) / 2;
      scroller.scrollTo({
        top: scroller.scrollTop + offset - Math.max(centred, 24),
        behavior: 'smooth',
      });
    }
    card.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  };

  // Enter in a single-line field would submit the whole form by accident. The option
  // fields use Enter to add the next option instead (see OptionsEditor).
  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>): void => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) event.preventDefault();
  };

  return (
    // `relative` matters: the sr-only labels are absolutely positioned, and without a
    // positioned ancestor they escape the shell's overflow clip and stretch the whole
    // document, so scrolling or focusing can slide the app's top bar out of view.
    <div className="relative flex min-h-full flex-col">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handlePublish, handleInvalid)}
          onKeyDown={handleFormKeyDown}
          noValidate
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-6 pb-8">
            <div className="space-y-3">
              <Link
                to={ASSIGNMENTS_PATH}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                All assignments
              </Link>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  New assignment
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Build a quiz for one course. Choice questions are marked automatically; written
                  answers are marked by hand.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1 space-y-6">
                <section className="space-y-5 rounded-xl border border-border bg-card p-6">
                  <h2 className="text-base font-semibold text-foreground">Details</h2>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Title <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Quiz: REST and HTTP fundamentals" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Instructions <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="What should students know before they start?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="courseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Course <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={courseState.status !== 'success'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <span
                                  className={cn(
                                    'truncate',
                                    !selectedCourse && 'text-muted-foreground',
                                  )}
                                >
                                  {selectedCourse?.name ??
                                    (courseState.status === 'loading'
                                      ? 'Loading courses…'
                                      : 'Select a course')}
                                </span>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {courseState.status === 'success' &&
                                courseState.courses.map((course) => (
                                  <SelectItem key={course.id} value={course.id}>
                                    {course.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {courseState.status === 'error' && (
                            <p role="alert" className="text-xs text-destructive">
                              {courseState.message}{' '}
                              <button
                                type="button"
                                className="font-medium underline"
                                onClick={() => setCourseReloadKey((key) => key + 1)}
                              >
                                Try again
                              </button>
                              {courseState.sessionExpired && (
                                <>
                                  {' · '}
                                  <button
                                    type="button"
                                    className="font-medium underline"
                                    onClick={notifySessionExpired}
                                  >
                                    Sign in again
                                  </button>
                                </>
                              )}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Due date <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <DateTimePicker
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              minDate={today}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Questions</h2>
                    <p className="text-sm text-muted-foreground">
                      Pick each question&apos;s type from the dropdown on its card.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <QuestionEditor
                        key={field.id}
                        index={index}
                        total={fields.length}
                        onDuplicate={() => handleDuplicate(index)}
                        onMove={(direction) => handleMove(index, direction)}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </div>

                  {fields.length === 0 && (
                    <div
                      role={form.formState.submitCount > 0 ? 'alert' : undefined}
                      className={cn(
                        'rounded-xl border border-dashed px-4 py-10 text-center text-sm',
                        form.formState.submitCount > 0
                          ? 'border-destructive/40 text-destructive'
                          : 'border-border text-muted-foreground',
                      )}
                    >
                      {form.formState.submitCount > 0
                        ? 'Add at least one question before publishing.'
                        : 'No questions yet — add your first one below.'}
                    </div>
                  )}

                  <div
                    role="group"
                    aria-label="Add a question"
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border bg-card/60 p-3"
                  >
                    <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <Plus className="h-4 w-4" />
                      Add question
                    </span>
                    {QUESTION_TYPE_OPTIONS.map((option) => {
                      const Icon = QUESTION_TYPE_ICONS[option.value];
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append(emptyQuestion(option.value))}
                          aria-label={`Add ${option.label} question`}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="lg:sticky lg:top-6 lg:w-72 lg:shrink-0">
                <QuizOutline onJump={handleJump} />
              </div>
            </div>
          </div>

          {/* -bottom-6, not bottom-0: a sticky element sticks to the inside of its scroll
              container's padding, so bottom-0 would leave the main area's 24px gap under it. */}
          <div className="sticky -bottom-6 z-10 -mx-6 -mb-6 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">
            <p className="text-sm text-muted-foreground">
              {fields.length} {fields.length === 1 ? 'question' : 'questions'}
            </p>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate(ASSIGNMENTS_PATH)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish assignment
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
