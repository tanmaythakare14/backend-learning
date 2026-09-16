import { useEffect } from 'react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCT_NAME, DASHBOARD_PATH } from '../../constants';
import { OnboardingScreenLayout } from '../onboarding-screen-layout';

function GoogleIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28v-3.1H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

export function SignInScreen(): JSX.Element {
  const { isLoading, isAuthenticated, error, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(DASHBOARD_PATH, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleContinue = (): void => {
    void loginWithRedirect();
  };

  const handleGoogle = (): void => {
    void loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } });
  };

  return (
    <OnboardingScreenLayout>
      <div className="mb-7 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome to {PRODUCT_NAME}
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in or create an account to continue your learning journey.
        </p>
      </div>

      {error && (
        <p className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-destructive">
          {error.message}
        </p>
      )}

      <div className="space-y-3">
        <Button
          type="button"
          className="w-full"
          size="lg"
          disabled={isLoading}
          onClick={handleContinue}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Continue to sign in
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="lg"
          disabled={isLoading}
          onClick={handleGoogle}
        >
          <GoogleIcon />
          Continue with Google
        </Button>
      </div>

      <p className="mt-7 text-center text-[12px] text-muted-foreground">
        New here? Click "Continue to sign in" and choose Sign up on the next screen.
      </p>
    </OnboardingScreenLayout>
  );
}
