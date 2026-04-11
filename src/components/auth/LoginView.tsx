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
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sync external error
  React.useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      toast.error('Google login failed');
      setGoogleLoading(false);
    }
  };

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
          // If profile doesn't exist, we might want to check if this is the first user
          // But for security, we stick to the admin role check
          throw new Error('Profile not found or access denied.');
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
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="mb-12 flex flex-col items-center justify-center gap-6 text-center">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-[0_0_40px_rgba(var(--primary),0.3)]"
          >
            <ShieldCheck className="h-10 w-10" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">
              PRO<span className="text-primary">TASK</span>
            </h1>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
              Admin Command Center
            </p>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <CardHeader className="space-y-1 pb-8 text-center">
            <CardTitle className="text-2xl font-light tracking-tight text-white">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground/70">Enter your administrative credentials</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive border border-destructive/20"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </motion.div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                  <Input 
                    type="email" 
                    placeholder="admin@protask.com" 
                    className="h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-4 pb-8">
              <Button 
                type="submit"
                className="w-full h-14 gap-3 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_20px_rgba(var(--primary),0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Authorize Access
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative w-full py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-[#0d0d0d] px-4 text-muted-foreground/40">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-14 gap-3 text-base font-bold rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Chrome className="h-5 w-5" />
                    Login with Google
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/40"
        >
          Protected by Enterprise-Grade Security
        </motion.p>
      </motion.div>
    </div>
  );
};
