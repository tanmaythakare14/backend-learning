import { useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AppSidebar } from './AppSidebar';
import { AppTopBar, type AppTopBarUser } from './AppTopBar';

export interface AppShellProps {
  user: AppTopBarUser;
  children: ReactNode;
}

export function AppShell({ user, children }: AppShellProps): JSX.Element {
  const { logout } = useAuth0();
  const [collapsed, setCollapsed] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleConfirmLogout = (): void => {
    void logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onLogout={() => setIsLogoutConfirmOpen(true)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        title="Log out of Cognify?"
        description="You'll need to sign in again to access your account."
        confirmLabel="Log out"
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
