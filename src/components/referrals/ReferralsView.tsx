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

const mockReferrals: Referral[] = [
  { 
    id: '1', 
    referrer_id: '1', 
    referred_id: '2', 
    commission_earned: 4.52, 
    created_at: '2024-02-15T14:30:00Z',
    referrer: { id: '1', email: 'ahmadtariq1to90@gmail.com', full_name: 'Ahmad Tariq', role: 'admin', balance: 1250.50, referral_code: 'ADMIN01', referred_by: null, created_at: '2024-01-01T10:00:00Z' },
    referred: { id: '2', email: 'user1@example.com', full_name: 'John Doe', role: 'user', balance: 45.20, referral_code: 'JOHN45', referred_by: '1', created_at: '2024-02-15T14:30:00Z' }
  },
  { 
    id: '2', 
    referrer_id: '1', 
    referred_id: '3', 
    commission_earned: 1.20, 
    created_at: '2024-03-10T09:15:00Z',
    referrer: { id: '1', email: 'ahmadtariq1to90@gmail.com', full_name: 'Ahmad Tariq', role: 'admin', balance: 1250.50, referral_code: 'ADMIN01', referred_by: null, created_at: '2024-01-01T10:00:00Z' },
    referred: { id: '3', email: 'user2@example.com', full_name: 'Sarah Smith', role: 'user', balance: 12.00, referral_code: 'SARAH12', referred_by: '1', created_at: '2024-03-10T09:15:00Z' }
  },
  { 
    id: '3', 
    referrer_id: '2', 
    referred_id: '4', 
    commission_earned: 8.97, 
    created_at: '2024-03-20T16:45:00Z',
    referrer: { id: '2', email: 'user1@example.com', full_name: 'John Doe', role: 'user', balance: 45.20, referral_code: 'JOHN45', referred_by: '1', created_at: '2024-02-15T14:30:00Z' },
    referred: { id: '4', email: 'user3@example.com', full_name: 'Mike Johnson', role: 'user', balance: 89.75, referral_code: 'MIKE89', referred_by: '2', created_at: '2024-03-20T16:45:00Z' }
  },
];

export const ReferralsView = () => {
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
            <div className="text-2xl font-bold">482</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commission Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,450.20</div>
            <p className="text-xs text-muted-foreground">10% of task rewards</p>
          </CardContent>
        </Card>
        <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Referral Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
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
                {mockReferrals.map((referral) => (
                  <TableRow key={referral.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{referral.referrer?.full_name}</span>
                        <span className="text-xs text-muted-foreground">{referral.referrer?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{referral.referred?.full_name}</span>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
