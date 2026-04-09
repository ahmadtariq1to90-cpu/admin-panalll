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
  PieChart
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
import { Referral } from '@/src/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/src/lib/supabase';

export const ReferralsView = () => {
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalReferrals: 0,
    totalCommission: 0,
    referralRate: 0
  });

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*, referrer:profiles!referrer_id(*), referred:profiles!referred_id(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);

      // Calculate stats
      const totalCommission = data?.reduce((acc, curr) => acc + (curr.commission_earned || 0), 0) || 0;
      
      // Get unique referrers count
      const uniqueReferrers = new Set(data?.map(r => r.referrer_id)).size;
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const referralRate = totalUsers ? (uniqueReferrers / totalUsers) * 100 : 0;

      setStats({
        totalReferrals: data?.length || 0,
        totalCommission,
        referralRate
      });

    } catch (error: any) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReferrals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral System</h1>
          <p className="text-muted-foreground">Track user invitations and commission payouts (10%).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">Successful invitations</p>
          </CardContent>
        </Card>
        <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commission Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `$${stats.totalCommission.toFixed(2)}`}</div>
            <p className="text-xs text-muted-foreground">10% of task rewards</p>
          </CardContent>
        </Card>
        <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Referral Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `${stats.referralRate.toFixed(1)}%`}</div>
            <p className="text-xs text-muted-foreground">Users who invited others</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Referrals</CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search referrals..." className="pl-10 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl border bg-background/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Referrer (Inviter)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Referred (Invitee)</TableHead>
                  <TableHead>Commission Earned</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No referrals found.
                    </TableCell>
                  </TableRow>
                ) : (
                  referrals.map((referral) => (
                    <TableRow key={referral.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{referral.referrer?.full_name || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{referral.referrer?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{referral.referred?.full_name || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{referral.referred?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-600">
                          <DollarSign className="h-3 w-3" />
                          {referral.commission_earned.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View Chain</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
