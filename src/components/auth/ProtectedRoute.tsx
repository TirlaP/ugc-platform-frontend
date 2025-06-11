/**
 * Protected route component
 * Restricts access based on authentication and roles
 */

import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types/auth.types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  roles?: Role[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  roles = [],
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  console.log('🛡️ ProtectedRoute check:');
  console.log('- isAuthenticated:', isAuthenticated);
  console.log('- user:', user);
  console.log('- isLoading:', isLoading);
  console.log('- localStorage user:', localStorage.getItem('ugc-auth-user'));
  
  // Not authenticated
  if (!isAuthenticated || !user) {
    console.log("🚫 Redirecting to login - not authenticated");
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role permissions if specified
  if (roles.length > 0) {
    const hasRequiredRole = user.role && roles.includes(user.role as Role);

    if (!hasRequiredRole) {
      // User doesn't have required role
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <button onClick={() => window.history.back()} className="btn btn-secondary">
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Render protected content
  return children || <Outlet />;
}
