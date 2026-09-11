import { useState } from 'react';
import type { JSX } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { useAppDispatch } from '@/store/hooks';
import { loginThunk } from '@/store/slices/authSlice';
import { PRODUCT_NAME, CREATE_ACCOUNT_PATH, DASHBOARD_PATH } from '../../constants';
import { OnboardingScreenLayout } from '../onboarding-screen-layout';
import { SocialAuthButtons } from '../social-auth-buttons';
import { signInSchema, type SignInFormValues } from './schema';

export function SignInScreen(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const handleSignIn = async (data: SignInFormValues): Promise<void> => {
    setSubmitError(null);
    const result = await dispatch(loginThunk(data));
    if (loginThunk.rejected.match(result)) {
      setSubmitError(result.payload ?? 'Something went wrong. Please try again.');
      return;
    }
    toast.success(`Welcome back to ${PRODUCT_NAME}!`);
    const from = (location.state as { from?: Location })?.from?.pathname ?? DASHBOARD_PATH;
    navigate(from, { replace: true });
  };

  return (
    <OnboardingScreenLayout>
      <div className="mb-7 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to continue your learning journey.</p>
      </div>

      {submitError && (
        <p className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-destructive">
          {submitError}
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-5">
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
                      placeholder="Enter your password"
                      autoComplete="current-password"
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
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
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
        Don&apos;t have an account?{' '}
        <Link to={CREATE_ACCOUNT_PATH} className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </OnboardingScreenLayout>
  );
}
