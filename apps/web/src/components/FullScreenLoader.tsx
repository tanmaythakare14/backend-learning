import type { JSX } from 'react';
import { Loader2 } from 'lucide-react';

/** Full-viewport spinner shown while Auth0 restores the session. */
export function FullScreenLoader(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
