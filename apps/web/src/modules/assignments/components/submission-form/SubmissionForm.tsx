import { useState } from 'react';
import type { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/utils/apiError';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ALLOWED_FILE_EXTENSIONS, FILE_ACCEPT, MAX_FILE_BYTES } from '../../constants';
import { formatFileSize } from '../../utils';
import type { SubmissionFormProps } from '../../@types';
import { submissionFormSchema, type SubmissionFormSchemaValues } from './schema';

const EMPTY_VALUES: SubmissionFormSchemaValues = { answerText: '', file: null };

export function SubmissionForm({
  hasSubmission,
  isPastDue,
  onSubmit,
}: SubmissionFormProps): JSX.Element {
  // A native file input can't be cleared through React state, so remount it —
  // otherwise it keeps showing a filename the form no longer holds.
  const [fileInputKey, setFileInputKey] = useState(0);

  const form = useForm<SubmissionFormSchemaValues>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const clearFileInput = (): void => setFileInputKey((key) => key + 1);

  const handleSubmit = async (values: SubmissionFormSchemaValues): Promise<void> => {
    try {
      await onSubmit({ answerText: values.answerText.trim(), file: values.file });
      form.reset(EMPTY_VALUES);
      clearFileInput();
      toast.success(hasSubmission ? 'Submission updated' : 'Assignment submitted');
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="answerText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your answer</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="Type your answer, or paste a link to your work"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attachment (optional)</FormLabel>
              <FormControl>
                <Input
                  key={fileInputKey}
                  type="file"
                  accept={FILE_ACCEPT}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.files?.[0] ?? null)}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {ALLOWED_FILE_EXTENSIONS.join(', ')} · up to {MAX_FILE_BYTES / (1024 * 1024)} MB
              </p>
              {field.value && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{field.value.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(field.value.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange(null);
                      clearFileInput();
                    }}
                    className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent-soft hover:text-primary"
                    aria-label="Remove attachment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {isPastDue && (
          <p className="text-sm text-destructive">
            This assignment is past its due date — your submission will be marked late.
          </p>
        )}

        <div className="flex items-center justify-end border-t border-border pt-5">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {hasSubmission ? 'Resubmit' : 'Submit assignment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
