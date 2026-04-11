import React from 'react';
import { 
  UsersRound, 
  TrendingUp, 
  Search, 
  Filter, 
  ArrowRight, 
  DollarSign, 
  UserPlus,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Referral } from '@/src/types';
import { cn } from '@/lib/utils';
import { supabase, isUsingFallback } from '@/src/lib/supabase';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export const ReferralsView = () => {
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState({
    totalReferrals: 0,
    totalCommission: 0,
    referralRate: 0
  });

  const fetchReferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('referral')
        .select('*, referrer:users!referrer_id(*), referred:users!referred_id(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);

      // Calculate stats
      const totalCommission = data?.reduce((acc, curr) => acc + (curr.commission_earned || 0), 0) || 0;
      
      // Get unique referrers count
      const uniqueReferrers = new Set(data?.map(r => r.referrer_id)).size;
      const { count: totalUsers, error: userError } = await supabase.from('users').select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;
      
      const referralRate = totalUsers ? (uniqueReferrers / totalUsers) * 100 : 0;

      setStats({
        totalReferrals: data?.length || 0,
        totalCommission,
        referralRate
      });

    } catch (error: any) {
      console.error('Error fetching referrals:', error);
      setError(error.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReferrals();
  }, []);

  return (
    <div className="space-y-10">
      {isUsingFallback && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-500"
        >
          <AlertCircle className="h-5 w-5" />
          <div className="text-xs font-medium">
            <p className="font-bold uppercase tracking-wider mb-1">Warning: Using Fallback Credentials</p>
            <p className="opacity-80">You are seeing data from a default project. Configure your own Supabase credentials in the Secrets panel.</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between gap-3 text-rose-500"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div className="text-xs font-medium">
              <p className="font-bold uppercase tracking-wider mb-1">Database Error</p>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchReferrals}
            className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/10"
          >
            <RefreshCcw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </motion.div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em]">
          <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
          Network Expansion Analysis
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Referral Ecosystem</h1>
        <p className="text-muted-foreground max-w-2xl">
          Monitor the viral growth engine, track multi-level commission distribution, and analyze network density.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Total Network Nodes', value: stats.totalReferrals, sub: 'Successful invitations', icon: UsersRound, color: 'primary' },
          { label: 'Commission Liquidity', value: `$${stats.totalCommission.toFixed(2)}`, sub: '10% task reward share', icon: DollarSign, color: 'emerald-500' },
          { label: 'Network Density', value: `${stats.referralRate.toFixed(1)}%`, sub: 'Active inviter ratio', icon: TrendingUp, color: 'blue-500' }
        ].map((stat, i) => (
          <Card key={i} className="group relative border-white/5 bg-[#0d0d0d] p-6 overflow-hidden">
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-${stat.color}/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
                <stat.icon className={`h-4 w-4 text-${stat.color} opacity-60`} />
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold tracking-tight text-white">
                  {loading ? (
                    <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
                  ) : stat.value}
                </h3>
                <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">{stat.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-white/5 bg-[#0d0d0d] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-black/40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Network Propagation Log</h3>
            <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Real-time node connection telemetry</p>
          </div>
          <div className="relative w-full max-w-xs group">
            <div className="absolute -inset-1 bg-primary/20 blur-sm rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input placeholder="Search network..." className="pl-10 h-10 bg-[#0d0d0d] border-white/5 focus:border-primary/50 transition-all relative z-10 font-mono text-xs" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Source Node (Inviter)</TableHead>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Target Node (Invitee)</TableHead>
                <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Yield (Commission)</TableHead>
                <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Timestamp</TableHead>
                <TableHead className="text-right text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Analysis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell colSpan={6} className="py-6">
                      <Skeleton className="h-4 w-full bg-white/5" />
                    </TableCell>
                  </TableRow>
                ))
              ) : referrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">
                    No network expansion detected in current cycle
                  </TableCell>
                </TableRow>
              ) : (
                referrals.map((referral) => (
                  <TableRow key={referral.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">{referral.referrer?.full_name || 'Anonymous'}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/60">{referral.referrer?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white/80">{referral.referred?.full_name || 'Anonymous'}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/60">{referral.referred?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-500 text-sm">
                        <DollarSign className="h-3 w-3 opacity-50" />
                        {referral.commission_earned.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-mono text-muted-foreground/60">
                        {new Date(referral.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary hover:bg-primary/5 border border-white/5"
                      >
                        Trace Chain
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="bg-black/40 border-t border-white/5 p-4 flex items-center justify-between">
          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            Network Propagation Index: <span className="text-white font-bold">{referrals.length}</span> active connections
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-white/5 text-muted-foreground/40 hover:text-white hover:bg-white/5" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-white/5 text-muted-foreground/40 hover:text-white hover:bg-white/5" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
