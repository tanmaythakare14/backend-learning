import { useState } from 'react';
import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, FlaskConical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ApiError } from '@/utils/apiError';
import { SIGN_IN_PATH } from '../../constants';
import { OnboardingScreenLayout } from '../onboarding-screen-layout';
import { requestPasswordReset } from '../../service';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './schema';

export function ForgotPasswordScreen(): JSX.Element {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const handleSubmit = async (data: ForgotPasswordFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await requestPasswordReset(data.email);
      setSentTo(data.email);
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <OnboardingScreenLayout>
      <Link
        to={SIGN_IN_PATH}
        aria-label="Back to sign in"
        className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      {sentTo ? (
        <>
          <div className="mb-7 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Check your inbox
            </h1>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to{' '}
              <span className="font-medium text-foreground">{sentTo}</span>.
            </p>
          </div>

          <div className="flex w-full items-start gap-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3">
            <FlaskConical size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="mb-0.5 text-[12px] font-semibold text-amber-700">Demo only</p>
              <p className="text-[12px] text-amber-600">
                No SMTP server is configured for this environment, so the reset link is logged on
                the API server&apos;s console instead of emailed. Check the terminal running the API
                for a line containing the reset URL, then open that link to continue.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Didn&apos;t get it?{' '}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="font-medium text-primary hover:underline"
            >
              Try a different email
            </button>
          </p>
        </>
      ) : (
        <>
          <div className="mb-7 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Forgot your password?
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the email address on your account and we&apos;ll send you a link to reset your
              password.
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registered email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ada@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          </Form>

          <p className="mt-7 text-center text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link to={SIGN_IN_PATH} className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </OnboardingScreenLayout>
  );
}
