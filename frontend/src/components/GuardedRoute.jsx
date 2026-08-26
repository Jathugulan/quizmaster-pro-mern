import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSkeleton } from './Skeleton';

// Base guard: waits for auth readiness, redirects anonymous users to sign-in.
function BaseGuard({ role, children }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg p-6">
        <PageSkeleton cards={4} />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth/signin" replace />;
  // Role mismatch — send to that user's own dashboard rather than an error page.
  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
  }
  return children;
}

/** Route group accessible only to Student users. */
export function UserGuard({ children }) {
  return <BaseGuard role="user">{children}</BaseGuard>;
}

/** Route group accessible only to Admins. */
export function AdminGuard({ children }) {
  return <BaseGuard role="admin">{children}</BaseGuard>;
}

/** Root redirect resolver: signs in users into their area; guests to sign-in. */
export function HomeRedirect() {
  const { user, ready } = useAuth();
  if (!ready) return <PageSkeleton cards={4} />;
  if (!user) return <Navigate to="/auth/signin" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
}

/** Redirect used by already-authenticated visitors of the auth pages. */
export function GuestOnly({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <PageSkeleton cards={4} />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
  return children;
}