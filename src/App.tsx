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

  const [verifying, setVerifying] = React.useState(false);
  const [authStatus, setAuthStatus] = React.useState<string>('Initializing...');

  const [showBypass, setShowBypass] = React.useState(false);

  const verifyAdminRole = async (sessionUser: any, retryCount = 0): Promise<boolean> => {
    const OWNER_EMAIL = 'ahmadtariq1to90@gmail.com';
    const isOwner = sessionUser.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

    if (verifying && retryCount === 0) {
      console.log('Verification already in progress, skipping...');
      return false;
    }
    
    setVerifying(true);
    
    if (isOwner && !showBypass) {
      setTimeout(() => setShowBypass(true), 5000);
    }
    
    // Check metadata first - much faster as it's already in the sessionUser object
    const metadataRole = sessionUser.app_metadata?.role || sessionUser.user_metadata?.role;
    
    if (metadataRole === 'admin') {
      console.log('Admin role verified via metadata');
      setUser(sessionUser);
      setAuthError(null);
      setVerifying(false);
      return true;
    }

    // If owner and metadata check failed, we still try the DB but with a fallback
    setAuthStatus(retryCount > 0 ? `Retrying database check (Attempt ${retryCount + 1}/3)...` : 'Querying security database...');
    console.log(`Querying "users" table for: ${sessionUser.email} (Attempt ${retryCount + 1})`);

    try {
      const profilePromise = supabase
        .from('users')
        .select('role')
        .eq('id', sessionUser.id)
        .limit(1)
        .maybeSingle();

      const timeoutDuration = 30000; // Increased to 30s
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database response delayed')), timeoutDuration)
      );

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        console.warn('No profile record found for ID:', sessionUser.id);
        
        if (isOwner) {
          console.log('Owner bypass: Profile missing but granting access');
          setUser(sessionUser);
          setAuthError(null);
          return true;
        }
        
        throw new Error('Access denied. No administrator profile found.');
      }

      if (profile.role !== 'admin') {
        console.warn('Access denied: Unauthorized role:', profile.role);
        if (isOwner) {
          console.log('Owner bypass: Role mismatch but granting access');
          setUser(sessionUser);
          setAuthError(null);
          return true;
        }
        await supabase.auth.signOut();
        setUser(null);
        setAuthError('Access denied. Administrator privileges required.');
        return false;
      }

      console.log('Admin role verified via database');
      setUser(sessionUser);
      setAuthError(null);
      return true;
    } catch (err: any) {
      // SILENT BYPASS FOR OWNER ON ANY ERROR
      if (isOwner) {
        console.log('Owner bypass: Database error/timeout, granting emergency access');
        setUser(sessionUser);
        setAuthError(null);
        return true;
      }

      console.error(`Verification attempt ${retryCount + 1} failed:`, err.message);

      if (retryCount < 2 && (err.message.includes('delayed') || err.message.includes('unreachable') || err.message.includes('FetchError'))) {
        console.log('Retrying database connection...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return verifyAdminRole(sessionUser, retryCount + 1);
      }

      if (!err.message.includes('delayed')) {
        await supabase.auth.signOut();
        setUser(null);
      }
      
      setAuthError(err.message || 'Security verification failed');
      return false;
    } finally {
      if (retryCount === 0 || !user) {
        setVerifying(false);
      }
    }
  };

  React.useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      console.log('Starting auth initialization...');
      setAuthStatus('Connecting to security core...');
      
      // Safety timeout to prevent infinite loading (increased for retries)
      const timeoutId = setTimeout(() => {
        if (mounted && loading) {
          console.warn('Auth initialization timed out, forcing loading state to false');
          setLoading(false);
        }
      }, 60000);

      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.log('No active session or user found:', authError.message);
          if (mounted) setLoading(false);
          return;
        }

        if (authUser) {
          console.log('Authenticated user found:', authUser.email);
          await verifyAdminRole(authUser);
        }
      } catch (err: any) {
        console.error('Unexpected auth init error:', err);
        if (mounted) setAuthError('System initialization failed');
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change detected:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await verifyAdminRole(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAuthError(null);
      } else if (session?.user && !user && !verifying) {
        await verifyAdminRole(session.user);
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
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{authStatus}</p>
          </div>

          {showBypass && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const OWNER_EMAIL = 'ahmadtariq1to90@gmail.com';
                supabase.auth.getUser().then(({ data: { user: authUser } }) => {
                  if (authUser?.email === OWNER_EMAIL) {
                    console.log('Manual bypass triggered by owner');
                    setUser(authUser);
                    setLoading(false);
                  }
                });
              }}
              className="mt-2 text-[10px] font-bold text-primary border-primary/20 hover:bg-primary/5 uppercase tracking-widest rounded-xl"
            >
              Administrative Override
            </Button>
          )}

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
