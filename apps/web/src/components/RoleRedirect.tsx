import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../features/auth/hooks';
import { getHomeRoute } from '../lib/roles';

const RoleRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomeRoute(user?.role || '')} replace />;
};

export default RoleRedirect;
