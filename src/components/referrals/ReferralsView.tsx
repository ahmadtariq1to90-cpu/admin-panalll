import React from 'react';
import { 
  UsersRound, 
  TrendingUp, 
  Search, 
  ArrowRight, 
  DollarSign, 
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCcw
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
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const ReferralsView = () => {
  const [referrals, setReferrals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState({
    totalReferrals: 0,
    totalCommission: 0,
    referralRate: 0
  });
  const pageSize = 10;

  const fetchReferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, count, error } = await supabase
        .from('referral')
        .select('*, referrer:users!referrer_id(*), referred:users!referred_id(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;
      setReferrals(data || []);
      setTotalCount(count || 0);

      // Fetch overall stats (only on first load or periodically)
      if (page === 1) {
        const { data: allData } = await supabase.from('referral').select('commission_earned');
        const totalCommission = allData?.reduce((acc, curr) => acc + (curr.commission_earned || 0), 0) || 0;
        
        const { data: referrers } = await supabase.from('referral').select('referrer_id');
        const uniqueReferrers = new Set(referrers?.map(r => r.referrer_id)).size;
        
        const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const referralRate = totalUsers ? (uniqueReferrers / totalUsers) * 100 : 0;

        setStats({
          totalReferrals: count || 0,
          totalCommission,
          referralRate
        });
      }

    } catch (err: any) {
      console.error('Error fetching referrals:', err);
      setError(err.message || 'Failed to load referrals');
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReferrals();
  }, [page]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Network Analysis
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Referral Ecosystem</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Monitor the viral growth engine, track multi-level commission distribution, and analyze network density.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Total Network Nodes', value: stats.totalReferrals, sub: 'Successful invitations', icon: UsersRound, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Commission Liquidity', value: `$${stats.totalCommission.toFixed(2)}`, sub: 'Task reward share', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Network Density', value: `${stats.referralRate.toFixed(1)}%`, sub: 'Active inviter ratio', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' }
        ].map((stat, i) => (
          <Card key={i} className="border-border bg-card p-6 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  {loading && page === 1 ? <Skeleton className="h-8 w-20 bg-muted" /> : stat.value}
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{stat.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3 text-rose-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div className="text-xs font-medium">
              <p className="font-bold uppercase tracking-wider mb-0.5">Database Error</p>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchReferrals} className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white border-rose-200 hover:bg-rose-50">
            <RefreshCcw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </div>
      )}

      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Network Propagation Log</h3>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Real-time node connection telemetry</p>
          </div>
          <div className="relative w-full sm:max-w-xs group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search network..." className="pl-10 h-11 bg-background border-border focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Source Node (Inviter)</TableHead>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Target Node (Invitee)</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Yield (Commission)</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Timestamp</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Analysis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell colSpan={6} className="py-6"><Skeleton className="h-10 w-full bg-muted" /></TableCell>
                  </TableRow>
                ))
              ) : referrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground/40 font-bold text-[10px] uppercase tracking-widest">
                    No network expansion detected
                  </TableCell>
                </TableRow>
              ) : (
                referrals.map((referral) => (
                  <TableRow key={referral.id} className="hover:bg-muted/20 transition-colors border-border group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{referral.referrer?.full_name || 'Anonymous'}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{referral.referrer?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground/80">{referral.referred?.full_name || 'Anonymous'}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{referral.referred?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-emerald-600">+${referral.commission_earned.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 border-border"
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
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Showing Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest bg-background border-border hover:bg-muted"
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest bg-background border-border hover:bg-muted"
            >
              Next
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
