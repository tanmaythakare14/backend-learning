import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  MessageSquare,
  Presentation,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Student Management', path: '/students', icon: Users },
  { label: 'Message', path: '/messages', icon: MessageSquare },
  { label: 'Teachers', path: '/teachers', icon: Presentation },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout?: () => void;
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  onLogout,
}: AppSidebarProps): JSX.Element {
  return (
    <aside
      className={cn(
        'flex h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* Logo + collapse toggle */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-border px-4',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="truncate text-lg font-semibold tracking-tight text-foreground">
              Cognify
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent-soft hover:text-primary"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mx-auto mt-3 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent-soft hover:text-primary"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {/* Nav items */}
      <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors',
                'hover:bg-accent-soft hover:text-primary',
                collapsed && 'justify-center px-0',
                isActive && 'bg-accent-soft font-medium text-primary',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-border px-3 py-4">
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? 'Log out' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors',
            'hover:bg-destructive/5 hover:text-destructive',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
