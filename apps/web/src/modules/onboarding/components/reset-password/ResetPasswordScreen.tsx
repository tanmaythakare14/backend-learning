import { useState } from 'react';
import type { JSX } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ApiError } from '@/utils/apiError';
import { SIGN_IN_PATH, FORGOT_PASSWORD_PATH } from '../../constants';
import { OnboardingScreenLayout } from '../onboarding-screen-layout';
import { PasswordStrengthField } from '../password-strength-field';
import { resetPassword } from '../../service';
import { resetPasswordSchema, type ResetPasswordFormValues } from './schema';

export function ResetPasswordScreen(): JSX.Element {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleSubmit = async (data: ResetPasswordFormValues): Promise<void> => {
    if (!token) return;
    setSubmitError(null);
    try {
      await resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  if (!token) {
    return (
      <OnboardingScreenLayout>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            This link is invalid
          </h1>
          <p className="text-sm text-muted-foreground">
            Your password reset link is missing or malformed. Request a new one to continue.
          </p>
        </div>
        <Link
          to={FORGOT_PASSWORD_PATH}
          className={buttonVariants({ size: 'lg', className: 'mt-6 w-full' })}
        >
          Request a new link
        </Link>
      </OnboardingScreenLayout>
    );
  }

  return (
    <OnboardingScreenLayout>
      <div className="mb-7 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Set a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account. Make it something you haven&apos;t used before.
        </p>
      </div>

      {submitError && (
        <p className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-destructive">
          {submitError}
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      className="pr-11"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <PasswordStrengthField password={field.value} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      className="pr-11"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {form.formState.isSubmitting ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>
      </Form>

      <Dialog open={isSuccess}>
        <DialogContent
          className="max-w-[420px] overflow-hidden rounded-2xl p-0"
          showCloseButton={false}
        >
          <div className="overflow-hidden rounded-[inherit]">
            <div className="bg-gradient-to-b from-emerald-50/90 to-card px-6 pb-6 pt-8 text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                <CheckCircle2 className="relative h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                Password reset!
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Your password has been changed successfully.
              </p>
            </div>

            <div className="divide-y divide-border border-t border-border px-6">
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-foreground">Password updated</span>
                </div>
                <span className="rounded-full border border-primary/15 bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Done
                </span>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-foreground">Ready to sign in</span>
                </div>
                <span className="rounded-full border border-primary/15 bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Next
                </span>
              </div>
            </div>

            <div className="p-6 pt-5">
              <Link
                to={SIGN_IN_PATH}
                className={buttonVariants({ size: 'lg', className: 'w-full' })}
              >
                Sign in
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </OnboardingScreenLayout>
  );
}
