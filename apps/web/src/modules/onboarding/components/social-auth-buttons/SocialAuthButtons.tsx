import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

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

function AppleIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-foreground" aria-hidden="true">
      <path d="M16.36 1.43c0 1.14-.42 2.2-1.15 3.03-.86.98-2.14 1.72-3.37 1.62-.15-1.16.44-2.35 1.13-3.09.85-.93 2.29-1.63 3.39-1.56zM20.6 17.35c-.5 1.15-.74 1.66-1.38 2.68-.9 1.42-2.16 3.2-3.73 3.21-1.39.02-1.75-.9-3.63-.89-1.88.01-2.28.91-3.67.9-1.57-.02-2.76-1.62-3.66-3.04-2.52-3.94-2.78-8.57-1.22-11.03 1.1-1.75 2.85-2.77 4.49-2.77 1.67 0 2.72.92 4.1.92 1.34 0 2.16-.92 4.1-.92 1.46 0 3 .8 4.1 2.17-3.6 1.97-3.02 7.09.5 8.77z" />
    </svg>
  );
}

export function SocialAuthButtons(): JSX.Element {
  const handleSocialAuth = (provider: 'google' | 'apple'): void => {
    // MOCK:API — no OAuth provider is wired up yet, this is a UI-only demo.
    logger.info('Social auth clicked', { provider });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button type="button" variant="outline" onClick={() => handleSocialAuth('google')}>
        <GoogleIcon />
        Google
      </Button>
      <Button type="button" variant="outline" onClick={() => handleSocialAuth('apple')}>
        <AppleIcon />
        Apple
      </Button>
    </div>
  );
}
