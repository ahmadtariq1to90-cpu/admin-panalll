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
import { supabase } from '@/src/lib/supabase';

export const WithdrawalsView = () => {
  const [activeTab, setActiveTab] = React.useState('pending');
  const [withdrawals, setWithdrawals] = React.useState<Withdrawal[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWithdrawals();
  }, []);

  const filteredWithdrawals = withdrawals.filter(w => w.status === activeTab);

  const handleApprove = async (withdrawal: Withdrawal) => {
    try {
      // 1. Update withdrawal status
      const { error: updateError } = await supabase
        .from('withdrawals')
        .update({ status: 'approved' })
        .eq('id', withdrawal.id);

      if (updateError) throw updateError;

      // 2. Deduct balance from user
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', withdrawal.user_id).single();
      const newBalance = (profile?.balance || 0) - withdrawal.amount;

      if (newBalance < 0) {
        toast.error('Insufficient user balance to process this withdrawal.');
        // We might want to revert the status or mark as failed
        return;
      }

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', withdrawal.user_id);

      if (balanceError) throw balanceError;

      toast.success('Withdrawal approved!', {
        description: `Payment processed and $${withdrawal.amount.toFixed(2)} deducted from user balance.`,
      });
      fetchWithdrawals();
    } catch (error: any) {
      console.error('Error approving withdrawal:', error);
      toast.error('Failed to approve withdrawal');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      toast.error('Withdrawal rejected.', {
        description: 'The request has been cancelled.',
      });
      fetchWithdrawals();
    } catch (error: any) {
      console.error('Error rejecting withdrawal:', error);
      toast.error('Failed to reject withdrawal');
    }
  };

  const getMethodIcon = (method: string) => {
    if (!method) return <Wallet className="h-4 w-4" />;
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
                {withdrawals.filter(w => w.status === 'pending').length}
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
