import { useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { clearAuth } from '@/store/slices/authSlice';
import { AppSidebar } from './AppSidebar';
import { AppTopBar, type AppTopBarUser } from './AppTopBar';

export interface AppShellProps {
  user: AppTopBarUser;
  children: ReactNode;
}

export function AppShell({ user, children }: AppShellProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = (): void => {
    dispatch(clearAuth());
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
