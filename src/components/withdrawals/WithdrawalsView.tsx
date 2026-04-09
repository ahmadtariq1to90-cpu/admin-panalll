import React from 'react';
import { 
  Wallet, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRight
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Withdrawal } from '@/src/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const mockWithdrawals: Withdrawal[] = [
  { 
    id: '1', 
    user_id: '2', 
    amount: 25.00, 
    status: 'pending', 
    payment_method: 'PayPal', 
    payment_details: 'john.doe@example.com', 
    created_at: '2024-04-07T10:00:00Z',
    profiles: { id: '2', email: 'user1@example.com', full_name: 'John Doe', role: 'user', balance: 45.20, referral_code: 'JOHN45', referred_by: '1', created_at: '2024-02-15T14:30:00Z' }
  },
  { 
    id: '2', 
    user_id: '4', 
    amount: 50.00, 
    status: 'pending', 
    payment_method: 'Bank Transfer', 
    payment_details: 'Bank: Chase, Acc: 123456789', 
    created_at: '2024-04-07T11:30:00Z',
    profiles: { id: '4', email: 'user3@example.com', full_name: 'Mike Johnson', role: 'user', balance: 89.75, referral_code: 'MIKE89', referred_by: '2', created_at: '2024-03-20T16:45:00Z' }
  },
  { 
    id: '3', 
    user_id: '3', 
    amount: 10.00, 
    status: 'approved', 
    payment_method: 'Mobile Money', 
    payment_details: '+1234567890', 
    created_at: '2024-04-06T14:00:00Z',
    profiles: { id: '3', email: 'user2@example.com', full_name: 'Sarah Smith', role: 'user', balance: 12.00, referral_code: 'SARAH12', referred_by: '1', created_at: '2024-03-10T09:15:00Z' }
  },
];

export const WithdrawalsView = () => {
  const [activeTab, setActiveTab] = React.useState('pending');

  const filteredWithdrawals = mockWithdrawals.filter(w => w.status === activeTab);

  const handleApprove = (id: string) => {
    toast.success('Withdrawal approved!', {
      description: 'The payment has been processed and balance deducted.',
    });
  };

  const handleReject = (id: string) => {
    toast.error('Withdrawal rejected.', {
      description: 'The request has been cancelled.',
    });
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'paypal': return <CreditCard className="h-4 w-4" />;
      case 'bank transfer': return <Banknote className="h-4 w-4" />;
      case 'mobile money': return <Smartphone className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h1>
          <p className="text-muted-foreground">Manage user payout requests and transaction history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <DollarSign className="h-4 w-4" />
            Payout Summary
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Clock className="h-4 w-4" />
              Pending
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {mockWithdrawals.filter(w => w.status === 'pending').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Processed
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <XCircle className="h-4 w-4" />
              Rejected
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full max-w-xs hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search withdrawals..." className="pl-10 h-9" />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWithdrawals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No {activeTab} withdrawal requests.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWithdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{withdrawal.profiles?.full_name || 'N/A'}</span>
                              <span className="text-xs text-muted-foreground">{withdrawal.profiles?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-mono font-bold text-rose-600">
                              <DollarSign className="h-3 w-3" />
                              {withdrawal.amount.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              {getMethodIcon(withdrawal.payment_method)}
                              {withdrawal.payment_method}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                              {withdrawal.payment_details}
                            </code>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(withdrawal.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Payout Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="gap-2 text-emerald-600" onClick={() => handleApprove(withdrawal.id)}>
                                  <CheckCircle2 className="h-4 w-4" /> Approve & Pay
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleReject(withdrawal.id)}>
                                  <XCircle className="h-4 w-4" /> Reject Request
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2">
                                  <ArrowRight className="h-4 w-4" /> View User History
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
