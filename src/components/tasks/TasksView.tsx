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
  AlertCircle
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
import { TaskSubmission } from '@/src/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase';

export const TasksView = () => {
  const [activeTab, setActiveTab] = React.useState('pending');
  const [selectedSubmission, setSelectedSubmission] = React.useState<TaskSubmission | null>(null);
  const [submissions, setSubmissions] = React.useState<TaskSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select('*, profiles(*), tasks(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
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
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', submission.user_id).single();
      const newBalance = (profile?.balance || 0) + reward;
      
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', submission.user_id);

      if (balanceError) throw balanceError;

      // 3. Handle Referral Commission (10%)
      if (submission.profiles?.referred_by) {
        const commission = reward * 0.1;
        // Find referrer by referral_code
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id, balance')
          .eq('referral_code', submission.profiles.referred_by)
          .single();

        if (referrer) {
          await supabase.from('profiles').update({ balance: (referrer.balance || 0) + commission }).eq('id', referrer.id);
          // Log referral commission
          await supabase.from('referrals').insert({
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks Management</h1>
          <p className="text-muted-foreground">Review and approve user task submissions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Manage Tasks
          </Button>
          <Button className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Review Guidelines
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
                {submissions.filter(s => s.status === 'pending').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <XCircle className="h-4 w-4" />
              Rejected
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full max-w-xs hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search submissions..." className="pl-10 h-9" />
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
                      <TableHead>Task</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          No {activeTab} submissions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubmissions.map((submission) => (
                        <TableRow key={submission.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{submission.profiles?.full_name || 'N/A'}</span>
                              <span className="text-xs text-muted-foreground">{submission.profiles?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{submission.tasks?.title}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1">{submission.tasks?.description}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-emerald-600 border-emerald-200 bg-emerald-50">
                              +${submission.tasks?.reward.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(submission.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedSubmission(submission)}>
                                  <Eye className="h-4 w-4" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Review Task Submission</DialogTitle>
                                  <DialogDescription>
                                    Review the proof provided by {submission.profiles?.full_name} for the task "{submission.tasks?.title}".
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4 md:grid-cols-2">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold">User Details</h4>
                                      <div className="rounded-lg border p-3 text-sm space-y-1">
                                        <p><span className="text-muted-foreground">Name:</span> {submission.profiles?.full_name}</p>
                                        <p><span className="text-muted-foreground">Email:</span> {submission.profiles?.email}</p>
                                        <p><span className="text-muted-foreground">Current Balance:</span> ${submission.profiles?.balance.toFixed(2)}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold">Task Details</h4>
                                      <div className="rounded-lg border p-3 text-sm space-y-1">
                                        <p><span className="text-muted-foreground">Title:</span> {submission.tasks?.title}</p>
                                        <p><span className="text-muted-foreground">Reward:</span> ${submission.tasks?.reward.toFixed(2)}</p>
                                        <p className="text-muted-foreground italic mt-2">{submission.tasks?.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Proof of Completion</h4>
                                    <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted group">
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
                                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <ExternalLink className="h-8 w-8 text-white" />
                                          </a>
                                        </>
                                      ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                          No proof image provided
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                  <Button variant="outline" className="gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleReject(submission.id)}>
                                    <XCircle className="h-4 w-4" />
                                    Reject Submission
                                  </Button>
                                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(submission.id)}>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approve & Credit
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
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
