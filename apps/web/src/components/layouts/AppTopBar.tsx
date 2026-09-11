import type { JSX } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/utils/initials';

export interface AppTopBarUser {
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface AppTopBarProps {
  user: AppTopBarUser;
  hasUnreadNotifications?: boolean;
  onNotificationsClick?: () => void;
}

export function AppTopBar({
  user,
  hasUnreadNotifications,
  onNotificationsClick,
}: AppTopBarProps): JSX.Element {
  return (
    <header className="flex h-16 shrink-0 items-center justify-end border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onNotificationsClick}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent-soft hover:text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
          )}
        </button>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                'bg-accent-soft text-[13px] font-semibold text-primary',
              )}
            >
              {getInitials(user.fullName)}
            </div>
          )}
          <div className="leading-tight">
            <p className="text-sm font-medium text-foreground">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
