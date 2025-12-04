// components/admin/AdminRoute.tsx
/**
 * Route guard for admin-only pages
 * Redirects non-admin users to dashboard
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  // Show loading state
  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
