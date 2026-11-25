import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function RoleGate({ allowed = [], children }) {
  const { user } = useAuth();

  if (!user || (allowed.length > 0 && !allowed.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}

