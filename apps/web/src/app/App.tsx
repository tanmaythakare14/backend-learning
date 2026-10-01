import { Navigate, Route, Routes } from 'react-router-dom';
import type { JSX, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { SignInScreen } from '../modules/onboarding';
import { StudentManagementScreen, StudentDetailScreen } from '../modules/student-management';
import { MessageScreen } from '../modules/message';
import { CourseManagementScreen } from '../modules/course-management';
import { SettingsScreen } from '../modules/settings';
import { DashboardScreen } from '../modules/dashboard';
import { AssignmentsScreen, AssignmentDetailScreen } from '../modules/assignments';
import { CurrentProfileProvider } from '../context/CurrentProfileProvider';
import { useCurrentProfile } from '../context/currentProfileContext';
import { AppShell } from '../components/layouts';
import { Toaster } from '../components/ui/sonner';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthTokenBridge } from '../components/AuthTokenBridge';
import { FullScreenLoader } from '../components/FullScreenLoader';

/**
 * Auth0 redirects back to the origin, so the login callback lands on "/" with
 * ?code=…&state=… still in the URL. Redirecting away unconditionally replaced
 * that URL before the SDK had read it — which flashed the sign-in screen on
 * every login. Wait for the SDK to settle, then send the user onward.
 */
function RootRedirect(): JSX.Element {
  const { isLoading, isAuthenticated } = useAuth0();

  if (isLoading) return <FullScreenLoader />;

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function AuthenticatedShell({ children }: { children: ReactNode }): JSX.Element {
  const { state } = useCurrentProfile();
  const { user: auth0User } = useAuth0();

  // Until the profile is complete there is no name to show — only the sign-in
  // email (Auth0's own "name" for database users is that same email, so it is
  // deliberately not passed as a name).
  const email = (state.status === 'ready' ? state.profile.email : auth0User?.email) ?? '';
  const user =
    state.status === 'ready' && state.profile.profileComplete
      ? {
          fullName: `${state.profile.firstName} ${state.profile.lastName}`.trim(),
          email,
        }
      : email
        ? { email }
        : null;

  return (
    <AppShell user={user} isUserLoading={state.status === 'loading'}>
      {children}
    </AppShell>
  );
}

function App() {
  return (
    <CurrentProfileProvider>
      <Toaster />
      <AuthTokenBridge />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<SignInScreen />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <AuthenticatedShell>
                <DashboardScreen />
              </AuthenticatedShell>
            }
          />
          <Route
            path="/students"
            element={
              <AuthenticatedShell>
                <StudentManagementScreen />
              </AuthenticatedShell>
            }
          />
          <Route
            path="/students/:id"
            element={
              <AuthenticatedShell>
                <StudentDetailScreen />
              </AuthenticatedShell>
            }
          />
          <Route
            path="/messages"
            element={
              <AuthenticatedShell>
                <MessageScreen />
              </AuthenticatedShell>
            }
          />
          <Route
            path="/courses"
            element={
              <AuthenticatedShell>
                <CourseManagementScreen />
              </AuthenticatedShell>
            }
          />
          <Route
            path="/assignments"
            element={
              <AuthenticatedShell>
                <AssignmentsScreen />
              </AuthenticatedShell>
            }
          />
          <Route
            path="/assignments/:id"
            element={
              <AuthenticatedShell>
                <AssignmentDetailScreen />
              </AuthenticatedShell>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthenticatedShell>
                <SettingsScreen />
              </AuthenticatedShell>
            }
          />
        </Route>
      </Routes>
    </CurrentProfileProvider>
  );
}

export default App;
