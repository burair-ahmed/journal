// components/admin/AdminLayout.tsx
/**
 * Separate Admin Panel Layout with its own sidebar and header
 * Uses the global color theme (pink/fuchsia)
 */

import { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: FileText, label: 'Blog', path: '/admin/blog' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: Shield, label: 'Audit Log', path: '/admin/audit' },
];

export const AdminLayout = () => {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  // Loading state
  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Shield className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
        <p className="text-muted-foreground mb-4">
          You don't have permission to access this area.
        </p>
        <Button onClick={() => navigate('/')} className="bg-brand-gradient">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gradient rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-sidebar-foreground/70">Tradlyn Management</p>
            </div>
          </div>
        </div>

        {/* Back to Main App */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent"
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to App
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-gradient text-white shadow-lg'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white truncate max-w-[120px]">
                  {user?.email}
                </p>
                <p className="text-xs text-sidebar-foreground/50">Admin</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground/50 hover:text-white"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
