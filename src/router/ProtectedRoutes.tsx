import {useEffect} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {ROUTES} from '@/router/routes';
import { useSelector } from 'react-redux';
import type { RootState } from '@/services/store';

const ProtectedRoutes = () => {
  const savedToken: string | null = localStorage.getItem('token');
  const token: string | null = savedToken ? savedToken : null;
  const user = useSelector((s: RootState) => s.auth.user);
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate(ROUTES.signin);
      return;
    }
    const role = user?.userRole.toLowerCase();
    if (role === 'driver') {
      if (!location.pathname.startsWith('/driver')) {
        navigate(ROUTES.driver.bookings, { replace: true });
      }
      return;
    }
    if (role === 'ambulanceprovideradmin') {
      const allowedPrefixes = ['/ambulance', '/help-desk', '/settings'];
      const path = location.pathname;
      const allowed = allowedPrefixes.some(p => path.startsWith(p));
      if (!allowed) {
        navigate('/ambulance/amenities', { replace: true });
      }
    }
  }, [token, user?.userRole, location.pathname, navigate]);

  return <Outlet />;
};

export default ProtectedRoutes;
