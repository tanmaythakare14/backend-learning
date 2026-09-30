import type { JSX } from 'react';
import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProfileCompletionBannerProps } from '../../@types';

export function ProfileCompletionBanner({ onComplete }: ProfileCompletionBannerProps): JSX.Element {
  return (
    <div
      role="status"
      className="flex items-center gap-4 rounded-lg border border-primary/20 bg-accent-soft px-4 py-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-primary">
        <UserRound className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">Complete your profile</p>
        <p className="text-sm text-muted-foreground">
          Add your name and phone number so your team can recognise you.
        </p>
      </div>
      <Button type="button" onClick={onComplete}>
        Complete profile
      </Button>
    </div>
  );
}
