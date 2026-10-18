import { Navigate, useLocation } from 'react-router-dom';
import { Splash } from '@/shared/ui/Splash';
import { homeFor } from '../model/roles';
import { useAuth } from '../model/useAuth';

/** Wrap any page that needs a signed-in user. Pass `roles` to restrict it, e.g. roles={['SELLER']}. */
export function ProtectedRoute({ roles, children }) {
  const { status, user, endedReason } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Splash />;

  if (status !== 'authenticated') {
    const from = endedReason === 'logout' ? undefined : location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from, expired: endedReason === 'expired' }} />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}
