import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  ExternalLink,
  CheckSquare,
  AlertCircle,
  DollarSign,
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'motion/react';
import { TaskSubmission } from '@/src/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase, isUsingFallback } from '@/src/lib/supabase';
import { RefreshCcw } from 'lucide-react';

export const TasksView = () => {
  const [activeTab, setActiveTab] = React.useState('pending');
  const [selectedSubmission, setSelectedSubmission] = React.useState<TaskSubmission | null>(null);
  const [submissions, setSubmissions] = React.useState<TaskSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select('*, users(*), tasks(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      setError(error.message || 'Failed to load submissions');
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(s => s.status === activeTab);

  const handleApprove = async (submission: TaskSubmission) => {
    try {
      // 1. Update submission status
      const { error: updateError } = await supabase
        .from('task_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      // 2. Credit user balance
      const reward = submission.tasks?.reward || 0;
      
      // Fetch current balance first to be safe
      const { data: profile } = await supabase.from('users').select('balance').eq('id', submission.user_id).single();
      const newBalance = (profile?.balance || 0) + reward;
      
      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', submission.user_id);

      if (balanceError) throw balanceError;

      // 3. Handle Referral Commission (10%)
      if (submission.users?.referred_by) {
        const commission = reward * 0.1;
        // Find referrer by referral_code
        const { data: referrer } = await supabase
          .from('users')
          .select('id, balance')
          .eq('referral_code', submission.users.referred_by)
          .single();

        if (referrer) {
          await supabase.from('users').update({ balance: (referrer.balance || 0) + commission }).eq('id', referrer.id);
          // Log referral commission
          await supabase.from('referral').insert({
            referrer_id: referrer.id,
            referred_id: submission.user_id,
            commission_earned: commission
          });
        }
      }

      toast.success('Task approved successfully!', {
        description: `User credited with $${reward.toFixed(2)}.`,
      });
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error: any) {
      console.error('Error approving task:', error);
      toast.error('Failed to approve task');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      toast.error('Task rejected.', {
        description: 'The submission has been marked as invalid.',
      });
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error: any) {
      console.error('Error rejecting task:', error);
      toast.error('Failed to reject task');
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
            onClick={fetchSubmissions}
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
          Validation Protocol Active
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Task Submissions</h1>
        <p className="text-muted-foreground max-w-2xl">
          Review personnel performance, validate proof of completion, and authorize reward distribution.
        </p>
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="bg-black/40 border border-white/5 p-1 h-12">
            <TabsTrigger value="pending" className="gap-2 h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-black font-mono text-[10px] uppercase tracking-widest transition-all">
              <Clock className="h-3 w-3" />
              Pending
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] bg-white/10 text-white border-none">
                {submissions.filter(s => s.status === 'pending').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2 h-10 px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-black font-mono text-[10px] uppercase tracking-widest transition-all">
              <CheckCircle2 className="h-3 w-3" />
              Approved
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
              <Input placeholder="Search telemetry..." className="pl-10 h-10 bg-[#0d0d0d] border-white/5 focus:border-primary/50 transition-all relative z-10 font-mono text-xs" />
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
                    <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Objective</TableHead>
                    <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Reward Value</TableHead>
                    <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Timestamp</TableHead>
                    <TableHead className="text-right text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-white/5">
                        <TableCell colSpan={5} className="py-8">
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
                  ) : filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-60 text-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">
                        No {activeTab} submissions detected in the stream
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">{submission.users?.full_name || 'Anonymous'}</span>
                            <span className="text-[10px] font-mono text-muted-foreground/60">{submission.users?.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-white/80">{submission.tasks?.title}</span>
                            <span className="text-[10px] font-mono text-muted-foreground/40 line-clamp-1 uppercase tracking-tight">{submission.tasks?.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-500 text-sm">
                            <DollarSign className="h-3 w-3 opacity-50" />
                            {submission.tasks?.reward.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/60">
                              <Clock className="h-3 w-3 opacity-40" />
                              {new Date(submission.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary hover:bg-primary/5 border border-white/5"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <Eye className="h-3 w-3 mr-2" />
                                Inspect
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl bg-[#0d0d0d] border-white/10 text-white p-0 overflow-hidden">
                              <div className="p-8 space-y-8">
                                <DialogHeader>
                                  <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.3em] mb-2">
                                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                    Submission Inspection
                                  </div>
                                  <DialogTitle className="text-2xl font-bold">Verification Protocol</DialogTitle>
                                  <DialogDescription className="text-muted-foreground/60 font-mono text-xs uppercase tracking-wider">
                                    Reviewing telemetry for {submission.profiles?.full_name}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-8 md:grid-cols-2">
                                  <div className="space-y-6">
                                    <div className="space-y-3">
                                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">Personnel Profile</h4>
                                      <div className="rounded-xl bg-black border border-white/5 p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                          <Avatar className="h-10 w-10 border border-white/10">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.user_id}`} />
                                            <AvatarFallback className="bg-primary/10 text-primary">{submission.users?.full_name?.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div className="flex flex-col">
                                            <p className="text-sm font-bold">{submission.users?.full_name}</p>
                                            <p className="text-[10px] font-mono text-muted-foreground/60">{submission.users?.email}</p>
                                          </div>
                                        </div>
                                        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                          <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Current Balance</span>
                                          <span className="text-sm font-mono font-bold text-emerald-500">${submission.users?.balance.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">Objective Data</h4>
                                      <div className="rounded-xl bg-black border border-white/5 p-4 space-y-3">
                                        <div>
                                          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-1">Title</p>
                                          <p className="text-sm font-bold text-white">{submission.tasks?.title}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-1">Reward</p>
                                          <p className="text-sm font-mono font-bold text-primary">${submission.tasks?.reward.toFixed(2)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-1">Description</p>
                                          <p className="text-xs text-muted-foreground/80 leading-relaxed">{submission.tasks?.description}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">Visual Evidence</h4>
                                    <div className="relative aspect-[4/5] rounded-xl border border-white/5 overflow-hidden bg-black group">
                                      {submission.proof_url ? (
                                        <>
                                          <img 
                                            src={submission.proof_url} 
                                            alt="Proof" 
                                            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                          <a 
                                            href={submission.proof_url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                                          >
                                            <ExternalLink className="h-5 w-5" />
                                          </a>
                                        </>
                                      ) : (
                                        <div className="flex flex-col h-full items-center justify-center text-muted-foreground/20 gap-4">
                                          <AlertCircle className="h-12 w-12" />
                                          <p className="text-[10px] font-mono uppercase tracking-[0.2em]">No Evidence Found</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-black/60 border-t border-white/5 p-6 flex items-center justify-end gap-3">
                                <Button 
                                  variant="ghost" 
                                  className="h-12 px-8 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20" 
                                  onClick={() => handleReject(submission.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button 
                                  className="h-12 px-8 text-[10px] font-bold uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400" 
                                  onClick={() => handleApprove(submission)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Authorize & Credit
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="bg-black/40 border-t border-white/5 p-4 flex items-center justify-between">
              <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                Showing <span className="text-white font-bold">{filteredSubmissions.length}</span> of <span className="text-white font-bold">{submissions.length}</span> telemetry records
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
