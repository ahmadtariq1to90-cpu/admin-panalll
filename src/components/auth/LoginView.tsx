import React from 'react';
import { 
  LayoutDashboard, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck,
  Loader2,
  AlertCircle,
  Chrome
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { motion } from 'motion/react';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
  externalError?: string | null;
}

export const LoginView = ({ onLoginSuccess, externalError }: LoginViewProps) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sync external error
  React.useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Attempting login for:', email);

    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth Error:', authError);
        throw authError;
      }

      if (user) {
        console.log('User authenticated, checking profile role...');
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile Error:', profileError);
          await supabase.auth.signOut();
          throw new Error('Access denied. Administrator profile not found.');
        }

        if (profile?.role !== 'admin') {
          console.warn('User is not an admin:', profile?.role);
          await supabase.auth.signOut();
          throw new Error('Access denied. Only administrators can access this panel.');
        }

        onLoginSuccess(user);
        toast.success('Welcome back, Admin!', {
          description: 'Successfully logged into the ProTask Admin Panel.',
        });
      }
    } catch (err: any) {
      console.error('Login Catch Block:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error('Login failed', {
        description: err.message || 'Please check your credentials and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              PRO<span className="text-primary">TASK</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Admin Command Center
            </p>
          </div>
        </div>

        <Card className="border border-border bg-card shadow-xl">
          <CardHeader className="space-y-1 pb-6 text-center">
            <CardTitle className="text-xl font-semibold tracking-tight">Administrator Login</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                  <Input 
                    type="email" 
                    placeholder="admin@protask.com" 
                    className="h-11 pl-10 bg-muted/30 border-border focus:border-primary/50 focus:ring-primary/20 transition-all rounded-lg" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-11 pl-10 bg-muted/30 border-border focus:border-primary/50 focus:ring-primary/20 transition-all rounded-lg" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-8">
              <Button 
                type="submit"
                className="w-full h-11 gap-2 text-sm font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Authorize Access
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          Secure Administrative Access Only
        </p>
      </div>
    </div>
  );
};
