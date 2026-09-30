import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentProfile } from '@/context/currentProfileContext';
import { SETTINGS_PROFILE_PATH } from '../constants';
import { ProfileCompletionBanner } from './profile-banner';

export function DashboardScreen(): JSX.Element {
  const navigate = useNavigate();
  const { state } = useCurrentProfile();

  // Only once the stored profile has loaded — showing it while loading would
  // flash the banner at users who have already completed theirs.
  const showBanner = state.status === 'ready' && !state.profile.profileComplete;

  return (
    <div className="space-y-6">
      {showBanner && <ProfileCompletionBanner onComplete={() => navigate(SETTINGS_PROFILE_PATH)} />}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Screen not built yet — sidebar/top bar preview only.
        </p>
      </div>
    </div>
  );
}
