import { Navigate, Route, Routes } from 'react-router-dom';
import type { JSX, ReactNode } from 'react';
import { CreateAccountScreen, SignInScreen } from '../modules/onboarding';
import { StudentManagementScreen, StudentDetailScreen } from '../modules/student-management';
import { MessageScreen } from '../modules/message';
import { AppShell } from '../components/layouts';
import { Toaster } from '../components/ui/sonner';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';

function AuthenticatedShell({ children }: { children: ReactNode }): JSX.Element {
  const user = useAppSelector(selectCurrentUser);

  return (
    <AppShell
      user={{
        fullName: user ? `${user.firstName} ${user.lastName}` : 'Signed-in user',
        email: user?.email ?? '',
      }}
    >
      {children}
    </AppShell>
  );
}

function PlaceholderPage({ title }: { title: string }): JSX.Element {
  return (
    <AuthenticatedShell>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Screen not built yet — sidebar/top bar preview only.
      </p>
    </AuthenticatedShell>
  );
}

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<CreateAccountScreen />} />
        <Route path="/login" element={<SignInScreen />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
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
          <Route path="/teachers" element={<PlaceholderPage title="Teachers" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
