import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks';
import { getHomeRoute } from '../lib/roles';

const RoleRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomeRoute(user?.role || '')} replace />;
};

export default RoleRedirect;
