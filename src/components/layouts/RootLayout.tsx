/**
 * Root layout component
 * Main wrapper for the entire application
 */

import { useAuth } from '@/hooks/useAuth';
import { Outlet, useNavigate } from 'react-router-dom';

interface RootLayoutProps {
  children?: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const { user, isLoading, checkAuth } = useAuth();
  const navigate = useNavigate();

  // Auth is automatically managed by Better Auth + useAuthSync

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // This layout now only handles auth sync and loading - no UI chrome
  return <>{children || <Outlet />}</>;
}
