import type { JSX } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

/** Gate for authenticated-only routes — redirects to /login, preserving where the user was headed. */
export function ProtectedRoute(): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
