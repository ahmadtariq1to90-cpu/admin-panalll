import React from 'react';
import { 
  Users, 
  CheckSquare, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Clock,
  ShieldCheck,
  Zap,
  Bell,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';
import { supabase, isUsingFallback } from '@/src/lib/supabase';
import { AlertCircle, RefreshCcw } from 'lucide-react';

const data = [
  { name: 'Mon', tasks: 40, earnings: 2400 },
  { name: 'Tue', tasks: 30, earnings: 1398 },
  { name: 'Wed', tasks: 20, earnings: 9800 },
  { name: 'Thu', tasks: 27, earnings: 3908 },
  { name: 'Fri', tasks: 18, earnings: 4800 },
  { name: 'Sat', tasks: 23, earnings: 3800 },
  { name: 'Sun', tasks: 34, earnings: 4300 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  delay?: number;
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <Card className="relative overflow-hidden border-border bg-card shadow-sm group transition-all hover:border-primary/30">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{title}</CardTitle>
      <div className={cn("p-2 rounded-lg bg-muted/50 border border-border group-hover:border-primary/20 transition-colors", color)}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold tracking-tight text-foreground mb-1">{value}</div>
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
        )}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trendValue}
        </div>
        <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">vs last 24h</span>
      </div>
    </CardContent>
  </Card>
);

export const DashboardView = () => {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    pendingTasks: 0,
    pendingWithdrawals: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [recentActivities, setRecentActivities] = React.useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        userRes,
        taskRes,
        withdrawalRes,
        earningsRes
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('users').select('balance')
      ]);
      
      if (userRes.error) throw userRes.error;
      if (taskRes.error) throw taskRes.error;
      if (withdrawalRes.error) throw withdrawalRes.error;
      if (earningsRes.error) throw earningsRes.error;

      const totalBalance = earningsRes.data?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0;

      setStats({
        totalUsers: userRes.count || 0,
        pendingTasks: taskRes.count || 0,
        pendingWithdrawals: withdrawalRes.count || 0,
        totalEarnings: totalBalance,
      });

      const { data: submissions, error: subError } = await supabase
        .from('task_submissions')
        .select('*, users(full_name, email), tasks(title, reward)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (subError) throw subError;
      setRecentActivities(submissions || []);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        {isUsingFallback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-xs font-medium">
              <p className="font-bold uppercase tracking-wider mb-0.5">Warning: Using Fallback Credentials</p>
              <p className="opacity-80">You haven't configured your own Supabase URL and Key. You are seeing data from a default project.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-xs font-medium flex-1">
              <p className="font-bold uppercase tracking-wider mb-0.5">Database Status: Error</p>
              <p className="opacity-80">Issue: {error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStats}
              className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white border-rose-200 hover:bg-rose-50"
            >
              <RefreshCcw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          System Operational
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Real-time intelligence and oversight for the ProTask ecosystem.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Personnel" 
          value={loading ? "..." : stats.totalUsers.toLocaleString()} 
          icon={Users} 
          trend="up" 
          trendValue="+12.5%"
          color="text-blue-600"
        />
        <StatCard 
          title="Pending Validation" 
          value={loading ? "..." : stats.pendingTasks.toLocaleString()} 
          icon={CheckSquare} 
          trend="down" 
          trendValue="-5.2%"
          color="text-amber-600"
        />
        <StatCard 
          title="Capital Outflow" 
          value={loading ? "..." : stats.pendingWithdrawals.toLocaleString()} 
          icon={Wallet} 
          trend="up" 
          trendValue="+8.1%"
          color="text-rose-600"
        />
        <StatCard 
          title="Total Liquidity" 
          value={loading ? "..." : `$${stats.totalEarnings.toLocaleString()}`} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+24.3%"
          color="text-emerald-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">Revenue Analytics</CardTitle>
                <CardDescription className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-wider">Financial throughput over time</CardDescription>
              </div>
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest px-3 bg-background shadow-sm text-foreground">Daily</Button>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest px-3 text-muted-foreground hover:text-foreground">Weekly</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.45 0.15 250)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="oklch(0.45 0.15 250)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(0,0,0,0.3)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="rgba(0,0,0,0.3)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: 'oklch(0.45 0.15 250)', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#000', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="oklch(0.45 0.15 250)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEarnings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Recent Telemetry</CardTitle>
            <CardDescription className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-wider">Live task submission feed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-full bg-muted" />
                      <Skeleton className="h-2.5 w-2/3 bg-muted" />
                    </div>
                  </div>
                ))
              ) : recentActivities.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground/40 font-bold text-[10px] uppercase tracking-widest">
                  No recent telemetry detected
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 group cursor-pointer">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.users?.email}`} />
                      <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{activity.users?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {activity.users?.full_name || 'Anonymous User'}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate">
                        {activity.tasks?.title || 'Unknown Task'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600">
                        +${activity.tasks?.reward?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60 font-medium">
                        {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 h-9 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-primary hover:bg-primary/5 border border-dashed border-border">
              Access Full Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border border-border bg-card shadow-sm p-4 rounded-xl flex items-center gap-4 group hover:border-primary/20 transition-all">
          <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Security Core</h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Active & Encrypted</p>
          </div>
        </div>
        <div className="border border-border bg-card shadow-sm p-4 rounded-xl flex items-center gap-4 group hover:border-primary/20 transition-all">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/5 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Database Sync</h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Latency: 24ms</p>
          </div>
        </div>
        <div className="border border-border bg-card shadow-sm p-4 rounded-xl flex items-center gap-4 group hover:border-primary/20 transition-all">
          <div className="h-10 w-10 rounded-lg bg-blue-500/5 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Task Engine</h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Operational</p>
          </div>
        </div>
        <div className="border border-border bg-card shadow-sm p-4 rounded-xl flex items-center gap-4 group hover:border-primary/20 transition-all">
          <div className="h-10 w-10 rounded-lg bg-rose-500/5 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Alert Matrix</h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">0 Critical Events</p>
          </div>
        </div>
      </div>
    </div>
  );
};
