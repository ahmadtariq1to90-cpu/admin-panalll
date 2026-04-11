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
import { Button } from '@/components/ui/button';

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
    let mounted = true;

    const initAuth = async () => {
      // Safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (mounted && loading) {
          console.warn('Auth initialization timed out, forcing loading state to false');
          setLoading(false);
        }
      }, 5000);

      try {
        console.log('Initializing auth session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setAuthError('Session retrieval failed: ' + sessionError.message);
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        if (session?.user) {
          console.log('Session found for user:', session.user.email);
          const isAdmin = await verifyAdminRole(session.user);
          if (mounted) {
            if (!isAdmin) {
              console.warn('User is not an admin, redirecting to login');
            }
            setLoading(false);
          }
        } else {
          console.log('No active session found');
          if (mounted) setLoading(false);
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setAuthError('Failed to initialize authentication: ' + (err.message || 'Unknown error'));
          setLoading(false);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event);
      if (session?.user) {
        await verifyAdminRole(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthError(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 blur-xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-bold text-foreground uppercase tracking-[0.2em]">Initializing Admin OS</p>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Verifying security credentials...</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="mt-4 text-[10px] font-bold text-muted-foreground/40 hover:text-primary hover:bg-primary/5 uppercase tracking-widest rounded-xl"
          >
            Stuck? Click to reload
          </Button>
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
      user={user}
    >
      {renderContent()}
    </AdminLayout>
  );
}
