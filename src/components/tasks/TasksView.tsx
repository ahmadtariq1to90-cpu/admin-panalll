import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Eye, 
  ExternalLink,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  CheckSquare
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase';

export const TasksView = () => {
  const [activeTab, setActiveTab] = React.useState('pending');
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const pageSize = 10;

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, count, error } = await supabase
        .from('task_submissions')
        .select('*, users(*), tasks(*)', { count: 'exact' })
        .eq('status', activeTab)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;
      setSubmissions(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
      setError(err.message || 'Failed to load submissions');
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSubmissions();
  }, [activeTab, page]);

  const handleApprove = async (submission: any) => {
    try {
      const { error: updateError } = await supabase
        .from('task_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      const reward = submission.tasks?.reward || 0;
      const { data: profile } = await supabase.from('users').select('balance').eq('id', submission.user_id).single();
      const newBalance = (profile?.balance || 0) + reward;
      
      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', submission.user_id);

      if (balanceError) throw balanceError;

      toast.success('Task approved successfully');
      fetchSubmissions();
    } catch (err: any) {
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
      toast.success('Task rejected');
      fetchSubmissions();
    } catch (err: any) {
      toast.error('Failed to reject task');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Validation Protocol
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Task Submissions</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Review personnel performance, validate proof of completion, and authorize reward distribution.
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
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2 h-9 px-6 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg">
              <XCircle className="h-3 w-3" />
              Rejected
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-full sm:max-w-xs group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search submissions..." className="pl-10 h-11 bg-card border-border focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl" />
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
            <Button variant="outline" size="sm" onClick={fetchSubmissions} className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white border-rose-200 hover:bg-rose-50">
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
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Objective</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Reward</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Timestamp</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-border">
                        <TableCell colSpan={5} className="py-6"><Skeleton className="h-10 w-full bg-muted" /></TableCell>
                      </TableRow>
                    ))
                  ) : submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground/40 font-bold text-[10px] uppercase tracking-widest">
                        No {activeTab} submissions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((submission) => (
                      <TableRow key={submission.id} className="hover:bg-muted/20 transition-colors border-border group">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{submission.users?.full_name || 'Anonymous'}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{submission.users?.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col max-w-[200px]">
                            <span className="text-xs font-bold text-foreground truncate">{submission.tasks?.title}</span>
                            <span className="text-[10px] text-muted-foreground font-medium truncate">{submission.tasks?.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-emerald-600">${submission.tasks?.reward?.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger render={
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-[10px] font-bold uppercase tracking-widest bg-background border-border hover:bg-muted"
                              />
                            }>
                              <Eye className="h-3 w-3 mr-2" />
                              Inspect
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden rounded-2xl shadow-2xl">
                              <div className="p-8 space-y-6">
                                <DialogHeader>
                                  <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Submission Inspection
                                  </div>
                                  <DialogTitle className="text-2xl font-bold text-foreground">Verification Protocol</DialogTitle>
                                  <DialogDescription className="text-muted-foreground text-xs font-medium">
                                    Reviewing evidence for {submission.users?.full_name}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-6 md:grid-cols-2">
                                  <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Personnel Data</h4>
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-border">
                                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.user_id}`} />
                                          <AvatarFallback className="bg-primary/5 text-primary">{submission.users?.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                          <p className="text-xs font-bold text-foreground">{submission.users?.full_name}</p>
                                          <p className="text-[10px] text-muted-foreground font-medium">{submission.users?.email}</p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Objective Info</h4>
                                      <div className="space-y-1">
                                        <p className="text-xs font-bold text-foreground">{submission.tasks?.title}</p>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">{submission.tasks?.description}</p>
                                      </div>
                                      <div className="pt-2 border-t border-border flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Reward</span>
                                        <span className="text-sm font-bold text-emerald-600">${submission.tasks?.reward?.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Visual Evidence</h4>
                                    <div className="aspect-[4/5] rounded-xl border border-border overflow-hidden bg-muted/20 relative group">
                                      {submission.proof_url ? (
                                        <>
                                          <img 
                                            src={submission.proof_url} 
                                            alt="Proof" 
                                            className="h-full w-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                          <a 
                                            href={submission.proof_url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                          >
                                            <ExternalLink className="h-6 w-6 text-white" />
                                          </a>
                                        </>
                                      ) : (
                                        <div className="flex flex-col h-full items-center justify-center text-muted-foreground/30 gap-2">
                                          <AlertCircle className="h-8 w-8" />
                                          <p className="text-[10px] font-bold uppercase tracking-widest">No Evidence</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-muted/30 border-t border-border p-6 flex items-center justify-end gap-3">
                                <Button 
                                  variant="outline" 
                                  className="h-11 px-6 text-[10px] font-bold uppercase tracking-widest text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200" 
                                  onClick={() => handleReject(submission.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button 
                                  className="h-11 px-6 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90" 
                                  onClick={() => handleApprove(submission)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Authorize
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
