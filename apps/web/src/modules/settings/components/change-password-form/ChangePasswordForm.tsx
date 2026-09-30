import type { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/utils/apiError';
import { changePassword } from '../../service';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordField } from '@/components/common/PasswordField';
import { Button } from '@/components/ui/button';
import {
  changePasswordFormSchema,
  PASSWORD_MIN_LENGTH,
  type ChangePasswordFormSchemaValues,
} from './schema';

const EMPTY_VALUES: ChangePasswordFormSchemaValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function ChangePasswordForm(): JSX.Element {
  const form = useForm<ChangePasswordFormSchemaValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const handleSubmit = async (values: ChangePasswordFormSchemaValues): Promise<void> => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password updated successfully.');
      form.reset(EMPTY_VALUES);
    } catch (error) {
      // handleHttpError already turned this into a user-safe message — Auth0's
      // own policy rejections come through here too.
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
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Current password <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <PasswordField autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                New password <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <PasswordField autoComplete="new-password" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                At least {PASSWORD_MIN_LENGTH} characters. A memorable passphrase of a few words
                works well.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Re-enter new password <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <PasswordField autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
          <Button
            type="button"
            variant="ghost"
            disabled={form.formState.isSubmitting}
            onClick={() => form.reset(EMPTY_VALUES)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </div>
      </form>
    </Form>
  );
}
