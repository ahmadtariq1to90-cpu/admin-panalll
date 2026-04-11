/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdminLayout } from '@/src/components/layout/AdminLayout';
import { DashboardView } from '@/src/components/dashboard/DashboardView';
import { UsersView } from '@/src/components/users/UsersView';
import { TasksView } from '@/src/components/tasks/TasksView';
import { WithdrawalsView } from '@/src/components/withdrawals/WithdrawalsView';
import { ReferralsView } from '@/src/components/referrals/ReferralsView';
import { NotificationsView } from '@/src/components/notifications/NotificationsView';
import { LoginView } from '@/src/components/auth/LoginView';
import { supabase } from '@/src/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const verifyAdminRole = async (sessionUser: any) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', sessionUser.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        console.warn('Access denied: Not an admin', profileError);
        await supabase.auth.signOut();
        setUser(null);
        setAuthError('Access denied. Only administrators can access this panel.');
        return false;
      }

      setUser(sessionUser);
      setAuthError(null);
      return true;
    } catch (err) {
      console.error('Role verification error:', err);
      await supabase.auth.signOut();
      setUser(null);
      setAuthError('Authentication failed. Please try again.');
      return false;
    }
  };

  React.useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        verifyAdminRole(session.user).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await verifyAdminRole(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Initializing Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLoginSuccess={setUser} externalError={authError} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'users':
        return <UsersView />;
      case 'tasks':
        return <TasksView />;
      case 'withdrawals':
        return <WithdrawalsView />;
      case 'referrals':
        return <ReferralsView />;
      case 'notifications':
        return <NotificationsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </AdminLayout>
  );
}
