import React from 'react';
import { 
  Users, 
  CheckSquare, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
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

const StatCard = ({ title, value, icon: Icon, description, trend, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card className="overflow-hidden border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm transition-all hover:shadow-2xl hover:shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span className={cn(
              "flex items-center text-xs font-medium",
              trend.isUp ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend.isUp ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
              {trend.value}
            </span>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
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
        // Fetch Total Users
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch Pending Tasks
        const { count: taskCount } = await supabase
          .from('task_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch Pending Withdrawals
        const { count: withdrawalCount } = await supabase
          .from('withdrawals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch Total Earnings (Sum of all approved task rewards)
        // This is a bit complex with just client-side, but we can estimate or fetch a summary
        const { data: earningsData } = await supabase
          .from('profiles')
          .select('balance');
        
        const totalBalance = earningsData?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0;

        setStats({
          totalUsers: userCount || 0,
          pendingTasks: taskCount || 0,
          pendingWithdrawals: withdrawalCount || 0,
          totalEarnings: totalBalance,
        });

        // Fetch Recent Activities (Submissions)
        const { data: submissions } = await supabase
          .from('task_submissions')
          .select('*, profiles(full_name), tasks(title)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (submissions) {
          setRecentActivities(submissions.map(s => ({
            user: s.profiles?.full_name || 'Unknown',
            action: `Submitted "${s.tasks?.title || 'Task'}"`,
            time: new Date(s.created_at).toLocaleTimeString(),
            amount: s.status === 'approved' ? `+$${s.tasks?.reward}` : null
          })));
        }

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Real-time performance and system health metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={loading ? "..." : stats.totalUsers.toLocaleString()}
          icon={Users}
          description="Registered on platform"
          trend={{ value: "+12.5%", isUp: true }}
          delay={0.1}
        />
        <StatCard
          title="Pending Tasks"
          value={loading ? "..." : stats.pendingTasks}
          icon={CheckSquare}
          description="Awaiting review"
          trend={{ value: "-5.2%", isUp: false }}
          delay={0.2}
        />
        <StatCard
          title="Pending Withdrawals"
          value={loading ? "..." : stats.pendingWithdrawals}
          icon={Wallet}
          description="Processing requests"
          trend={{ value: "+8.1%", isUp: true }}
          delay={0.3}
        />
        <StatCard
          title="Total User Balance"
          value={loading ? "..." : `$${stats.totalEarnings.toLocaleString()}`}
          icon={TrendingUp}
          description="Circulating rewards"
          trend={{ value: "+15.3%", isUp: true }}
          delay={0.4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Earnings Analytics</CardTitle>
            <CardDescription>Daily revenue trends for the past week.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEarnings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>Daily task volume across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.length > 0 ? recentActivities.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {item.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.user}</p>
                      <p className="text-xs text-muted-foreground">{item.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.amount && <p className={cn("text-xs font-bold", item.amount.startsWith('+') ? "text-emerald-500" : "text-rose-500")}>{item.amount}</p>}
                    <p className="text-[10px] text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-center text-muted-foreground py-4">No recent activities found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
            <CardDescription>Current status of platform services.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Supabase DB', status: 'Operational', color: 'text-emerald-500' },
                { label: 'Auth Service', status: 'Operational', color: 'text-emerald-500' },
                { label: 'Task Engine', status: 'Operational', color: 'text-emerald-500' },
                { label: 'Payment Gateway', status: 'Operational', color: 'text-emerald-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full animate-pulse", item.color.replace('text', 'bg'))} />
                    <span className={cn("text-xs font-medium", item.color)}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
