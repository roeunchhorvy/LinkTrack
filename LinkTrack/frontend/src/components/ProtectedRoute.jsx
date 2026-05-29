import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

// Wraps any route that requires the user to be logged in.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
