import { useState } from 'react';
import type { JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { logger } from '@/utils/logger';
import { ApiError } from '@/utils/apiError';
import { useAppDispatch } from '@/store/hooks';
import { loginThunk } from '@/store/slices/authSlice';
import { PRODUCT_NAME, SIGN_IN_PATH, DASHBOARD_PATH } from '../../constants';
import { OnboardingScreenLayout } from '../onboarding-screen-layout';
import { PasswordStrengthField } from './PasswordStrengthField';
import { SocialAuthButtons } from '../social-auth-buttons';
import { createAccountSchema, type CreateAccountFormValues } from './schema';
import { registerAccount, formValuesToRegisterPayload } from '../../service';

export function CreateAccountScreen(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    mode: 'onChange',
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  });

  const handleCreateAccount = async (data: CreateAccountFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      const created = await registerAccount(formValuesToRegisterPayload(data));
      logger.info('Account created', { userId: created.id });

      // Register doesn't issue a session — sign the new account in immediately.
      const sessionResult = await dispatch(
        loginThunk({ email: data.email, password: data.password }),
      );
      if (loginThunk.rejected.match(sessionResult)) {
        toast.success(`Welcome to ${PRODUCT_NAME}!`, {
          description: 'Your account was created — please sign in.',
        });
        navigate(SIGN_IN_PATH);
        return;
      }

      toast.success(`Welcome to ${PRODUCT_NAME}!`, {
        description: 'Your account has been created.',
      });
      navigate(DASHBOARD_PATH);
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
    <OnboardingScreenLayout>
      <div className="mb-7 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start learning with 300+ expert-led courses, free.
        </p>
      </div>

      {submitError && (
        <p className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-destructive">
          {submitError}
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateAccount)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ada" autoComplete="given-name" {...field} />
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
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Lovelace" autoComplete="family-name" {...field} />
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
                <FormLabel>Email address</FormLabel>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
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

          <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </Form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">Or continue with</span>
        <Separator className="flex-1" />
      </div>

      <SocialAuthButtons />

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={SIGN_IN_PATH} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </OnboardingScreenLayout>
  );
}
