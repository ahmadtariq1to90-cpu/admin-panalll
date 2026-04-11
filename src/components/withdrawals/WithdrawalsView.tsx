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
  ArrowRight,
  ChevronLeft,
  ChevronRight
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
import { Skeleton } from '@/components/ui/skeleton';
import { Withdrawal } from '@/src/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase, isUsingFallback } from '@/src/lib/supabase';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export const WithdrawalsView = () => {
  const [activeTab, setActiveTab] = React.useState('pending');
  const [withdrawals, setWithdrawals] = React.useState<Withdrawal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*, users(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      setError(error.message || 'Failed to load withdrawals');
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
      const { data: profile } = await supabase.from('users').select('balance').eq('id', withdrawal.user_id).single();
      const newBalance = (profile?.balance || 0) - withdrawal.amount;

      if (newBalance < 0) {
        toast.error('Insufficient user balance to process this withdrawal.');
        // We might want to revert the status or mark as failed
        return;
      }

      const { error: balanceError } = await supabase
        .from('users')
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
            onClick={fetchWithdrawals}
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
          Financial Outflow Monitoring
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Withdrawal Requests</h1>
        <p className="text-muted-foreground max-w-2xl">
          Authorize capital distribution, validate payment destinations, and maintain transaction integrity.
        </p>
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="bg-black/40 border border-white/5 p-1 h-12">
            <TabsTrigger value="pending" className="gap-2 h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-black font-mono text-[10px] uppercase tracking-widest transition-all">
              <Clock className="h-3 w-3" />
              Pending
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] bg-white/10 text-white border-none">
                {withdrawals.filter(w => w.status === 'pending').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2 h-10 px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-black font-mono text-[10px] uppercase tracking-widest transition-all">
              <CheckCircle2 className="h-3 w-3" />
              Processed
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2 h-10 px-6 data-[state=active]:bg-rose-500 data-[state=active]:text-black font-mono text-[10px] uppercase tracking-widest transition-all">
              <XCircle className="h-3 w-3" />
              Rejected
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-xs group">
              <div className="absolute -inset-1 bg-primary/20 blur-sm rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input placeholder="Search transactions..." className="pl-10 h-10 bg-[#0d0d0d] border-white/5 focus:border-primary/50 transition-all relative z-10 font-mono text-xs" />
            </div>
            <Button variant="ghost" className="h-10 w-10 p-0 border border-white/5 text-muted-foreground/60 hover:text-white hover:bg-white/5">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-8">
          <Card className="border-white/5 bg-[#0d0d0d] shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/40 border-b border-white/5">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Personnel</TableHead>
                    <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Capital Amount</TableHead>
                    <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Transfer Method</TableHead>
                    <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Destination Data</TableHead>
                    <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Timestamp</TableHead>
                    <TableHead className="text-right text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Operations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-white/5">
                        <TableCell colSpan={6} className="py-8">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-1/3 bg-white/5" />
                              <Skeleton className="h-3 w-1/4 bg-white/5" />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredWithdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-60 text-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">
                        No {activeTab} withdrawal requests detected
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWithdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">{withdrawal.users?.full_name || 'Anonymous'}</span>
                            <span className="text-[10px] font-mono text-muted-foreground/60">{withdrawal.users?.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-mono font-bold text-rose-500 text-sm">
                            <DollarSign className="h-3 w-3 opacity-50" />
                            {withdrawal.amount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-white/80 uppercase tracking-wider">
                            <div className="p-1.5 rounded-md bg-white/5 border border-white/5">
                              {getMethodIcon(withdrawal.payment_method)}
                            </div>
                            {withdrawal.payment_method}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded-md bg-black border border-white/5 px-2 py-1 text-[10px] font-mono font-bold text-primary/80">
                            {withdrawal.payment_details}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/60">
                              <Clock className="h-3 w-3 opacity-40" />
                              {new Date(withdrawal.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-white/5 text-muted-foreground/60 hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-black border-white/10 text-white">
                              <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Payout Operations</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-white/5" />
                              <DropdownMenuItem 
                                className="gap-3 text-xs font-medium focus:bg-emerald-500/10 focus:text-emerald-500 cursor-pointer text-emerald-500/80"
                                onClick={() => handleApprove(withdrawal)}
                              >
                                <CheckCircle2 className="h-4 w-4 opacity-60" /> Authorize & Process
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-3 text-xs font-medium focus:bg-rose-500/10 focus:text-rose-500 cursor-pointer text-rose-500/80"
                                onClick={() => handleReject(withdrawal.id)}
                              >
                                <XCircle className="h-4 w-4 opacity-60" /> Deny Request
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/5" />
                              <DropdownMenuItem className="gap-3 text-xs font-medium focus:bg-white/5 focus:text-primary cursor-pointer">
                                <ArrowRight className="h-4 w-4 opacity-60" /> Audit User History
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
            <div className="bg-black/40 border-t border-white/5 p-4 flex items-center justify-between">
              <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                Showing <span className="text-white font-bold">{filteredWithdrawals.length}</span> of <span className="text-white font-bold">{withdrawals.length}</span> transaction records
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
