import React from 'react';
import { 
  Wallet, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCcw,
  MoreHorizontal
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
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase';

export const WithdrawalsView = () => {
  const [activeTab, setActiveTab] = React.useState('pending');
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const pageSize = 10;

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, count, error } = await supabase
        .from('withdrawals')
        .select('*, users(*)', { count: 'exact' })
        .eq('status', activeTab)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;
      setWithdrawals(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching withdrawals:', err);
      setError(err.message || 'Failed to load withdrawals');
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWithdrawals();
  }, [activeTab, page]);

  const handleApprove = async (withdrawal: any) => {
    try {
      const { error: updateError } = await supabase
        .from('withdrawals')
        .update({ status: 'approved' })
        .eq('id', withdrawal.id);

      if (updateError) throw updateError;

      const { data: profile } = await supabase.from('users').select('balance').eq('id', withdrawal.user_id).single();
      const newBalance = (profile?.balance || 0) - withdrawal.amount;

      if (newBalance < 0) {
        toast.error('Insufficient user balance');
        return;
      }

      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', withdrawal.user_id);

      if (balanceError) throw balanceError;

      toast.success('Withdrawal approved');
      fetchWithdrawals();
    } catch (err: any) {
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
      toast.success('Withdrawal rejected');
      fetchWithdrawals();
    } catch (err: any) {
      toast.error('Failed to reject withdrawal');
    }
  };

  const getMethodIcon = (method: string) => {
    if (!method) return <Wallet className="h-3.5 w-3.5" />;
    switch (method.toLowerCase()) {
      case 'paypal': return <CreditCard className="h-3.5 w-3.5" />;
      case 'bank transfer': return <Banknote className="h-3.5 w-3.5" />;
      case 'mobile money': return <Smartphone className="h-3.5 w-3.5" />;
      default: return <Wallet className="h-3.5 w-3.5" />;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Financial Monitoring
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Withdrawal Requests</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Authorize capital distribution, validate payment destinations, and maintain transaction integrity.
        </p>
      </div>

      <Tabs defaultValue="pending" onValueChange={(val) => { setActiveTab(val); setPage(1); }} className="w-full">
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
          <TabsList className="bg-muted/50 border border-border p-1 h-11 rounded-xl">
            <TabsTrigger value="pending" className="gap-2 h-9 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg">
              <Clock className="h-3 w-3" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2 h-9 px-6 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg">
              <CheckCircle2 className="h-3 w-3" />
              Processed
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2 h-9 px-6 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg">
              <XCircle className="h-3 w-3" />
              Rejected
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-full sm:max-w-xs group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search transactions..." className="pl-10 h-11 bg-card border-border focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl" />
          </div>
        </div>

        {error && (
          <div className="mt-8 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3 text-rose-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <div className="text-xs font-medium">
                <p className="font-bold uppercase tracking-wider mb-0.5">Database Error</p>
                <p className="opacity-80">{error}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchWithdrawals} className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white border-rose-200 hover:bg-rose-50">
              <RefreshCcw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          </div>
        )}

        <TabsContent value={activeTab} className="mt-8">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Personnel</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Amount</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Method</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Destination</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Timestamp</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Operations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-border">
                        <TableCell colSpan={6} className="py-6"><Skeleton className="h-10 w-full bg-muted" /></TableCell>
                      </TableRow>
                    ))
                  ) : withdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-muted-foreground/40 font-bold text-[10px] uppercase tracking-widest">
                        No {activeTab} requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id} className="hover:bg-muted/20 transition-colors border-border group">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{withdrawal.users?.full_name || 'Anonymous'}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{withdrawal.users?.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-rose-600">-${withdrawal.amount.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-foreground uppercase tracking-wider">
                            <div className="p-1.5 rounded-lg bg-muted border border-border text-muted-foreground">
                              {getMethodIcon(withdrawal.payment_method)}
                            </div>
                            {withdrawal.payment_method}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                            {withdrawal.payment_details}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {new Date(withdrawal.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" />}>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-1 border-border bg-card shadow-lg">
                              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 py-1.5">Payout Operations</DropdownMenuLabel>
                              <DropdownMenuItem 
                                className="text-xs font-medium focus:bg-emerald-50 focus:text-white cursor-pointer rounded-md"
                                onClick={() => handleApprove(withdrawal)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                Authorize Payout
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-xs font-medium focus:bg-rose-50 focus:text-rose-600 cursor-pointer rounded-md"
                                onClick={() => handleReject(withdrawal.id)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-2" />
                                Deny Request
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
          </Card>
        </TabsContent>
      </Tabs>

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
