import { Navigate, useLocation } from 'react-router-dom';
import { Splash } from '@/shared/ui/Splash';
import { homeFor } from '../model/roles';
import { useAuth } from '../model/useAuth';

/** For login/register: signed-in users are sent on to where they were headed, or their role's home. */
export function GuestRoute({ children }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Splash />;
  if (status === 'authenticated') return <Navigate to={location.state?.from ?? homeFor(user.role)} replace />;
  return children;
}
