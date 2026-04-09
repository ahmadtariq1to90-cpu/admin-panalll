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
  <Card className="relative overflow-hidden border-white/5 bg-[#0d0d0d] shadow-2xl group transition-all duration-500 hover:border-primary/30">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">{title}</CardTitle>
      <div className={cn("p-2 rounded-lg bg-black border border-white/5 group-hover:border-primary/20 transition-colors", color)}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold tracking-tight text-white mb-1 font-mono">{value}</div>
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trendValue}
        </div>
        <span className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-wider">vs last 24h</span>
      </div>
    </CardContent>
  </Card>
);

import { cn } from '@/lib/utils';
import { supabase } from '@/src/lib/supabase';

export const DashboardView = () => {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    pendingTasks: 0,
    pendingWithdrawals: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [recentActivities, setRecentActivities] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [
          { count: userCount },
          { count: taskCount },
          { count: withdrawalCount },
          { data: earningsData }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('profiles').select('balance')
        ]);
        
        const totalBalance = earningsData?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0;

        setStats({
          totalUsers: userCount || 0,
          pendingTasks: taskCount || 0,
          pendingWithdrawals: withdrawalCount || 0,
          totalEarnings: totalBalance,
        });

        const { data: submissions } = await supabase
          .from('task_submissions')
          .select('*, profiles(full_name, email), tasks(title, reward)')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentActivities(submissions || []);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em]">
          <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
          System Operational
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Command Center</h1>
        <p className="text-muted-foreground max-w-2xl">
          Real-time intelligence and oversight for the ProTask ecosystem. Monitor user growth, financial flows, and task throughput.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Personnel" 
          value={loading ? "..." : stats.totalUsers.toLocaleString()} 
          icon={Users} 
          trend="up" 
          trendValue="+12.5%"
          color="text-blue-500"
        />
        <StatCard 
          title="Pending Validation" 
          value={loading ? "..." : stats.pendingTasks.toLocaleString()} 
          icon={CheckSquare} 
          trend="down" 
          trendValue="-5.2%"
          color="text-amber-500"
        />
        <StatCard 
          title="Capital Outflow" 
          value={loading ? "..." : stats.pendingWithdrawals.toLocaleString()} 
          icon={Wallet} 
          trend="up" 
          trendValue="+8.1%"
          color="text-rose-500"
        />
        <StatCard 
          title="Total Liquidity" 
          value={loading ? "..." : `$${stats.totalEarnings.toLocaleString()}`} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+24.3%"
          color="text-emerald-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-white/5 bg-[#0d0d0d] shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white">Revenue Analytics</CardTitle>
                <CardDescription className="text-muted-foreground/60 text-xs font-mono uppercase tracking-wider">Financial throughput over time</CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest px-3 bg-white/5 text-white">Daily</Button>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest px-3 text-muted-foreground hover:text-white">Weekly</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="monospace"
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="monospace"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981', fontSize: '12px', fontFamily: 'monospace' }}
                    labelStyle={{ color: '#fff', fontSize: '10px', marginBottom: '4px', fontFamily: 'monospace' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEarnings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-white/5 bg-[#0d0d0d] shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Recent Telemetry</CardTitle>
            <CardDescription className="text-muted-foreground/60 text-xs font-mono uppercase tracking-wider">Live task submission feed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full bg-white/5" />
                      <Skeleton className="h-3 w-2/3 bg-white/5" />
                    </div>
                  </div>
                ))
              ) : recentActivities.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">
                  No recent telemetry detected
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 group cursor-pointer">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-primary/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Avatar className="h-10 w-10 border border-white/10 relative z-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.profiles?.email}`} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{activity.profiles?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                        {activity.profiles?.full_name || 'Anonymous User'}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-tight truncate">
                        {activity.tasks?.title || 'Unknown Task'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-emerald-500">
                        +${activity.tasks?.reward?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-[10px] text-muted-foreground/40 font-mono">
                        {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-8 h-10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary hover:bg-primary/5 border border-dashed border-white/5">
              Access Full Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/5 bg-[#0d0d0d] shadow-2xl p-6 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Security Core</h3>
          <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">Active & Encrypted</p>
        </Card>
        <Card className="border-white/5 bg-[#0d0d0d] shadow-2xl p-6 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Database Sync</h3>
          <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">Latency: 24ms</p>
        </Card>
        <Card className="border-white/5 bg-[#0d0d0d] shadow-2xl p-6 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Task Engine</h3>
          <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">Throughput: 1.2k/hr</p>
        </Card>
        <Card className="border-white/5 bg-[#0d0d0d] shadow-2xl p-6 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 group-hover:scale-110 transition-transform">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Alert Matrix</h3>
          <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">0 Critical Events</p>
        </Card>
      </div>
    </div>
  );
};
