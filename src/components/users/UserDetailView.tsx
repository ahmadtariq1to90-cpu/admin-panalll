import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar, 
  Shield, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  TrendingUp,
  History,
  Edit2,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { User, TaskSubmission, Withdrawal } from '@/src/types';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface UserDetailViewProps {
  user: User;
  onBack: () => void;
  onUpdate: (updatedUser: User) => void;
}

export const UserDetailView = ({ user, onBack, onUpdate }: UserDetailViewProps) => {
  const [editing, setEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<User>(user);
  const [loading, setLoading] = React.useState(false);
  const [submissions, setSubmissions] = React.useState<TaskSubmission[]>([]);
  const [withdrawals, setWithdrawals] = React.useState<Withdrawal[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(true);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const [subsRes, withRes] = await Promise.all([
        supabase
          .from('task_submissions')
          .select('*, tasks(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (subsRes.error) throw subsRes.error;
      if (withRes.error) throw withRes.error;

      setSubmissions(subsRes.data || []);
      setWithdrawals(withRes.data || []);
    } catch (error: any) {
      console.error('Error fetching user history:', error);
      toast.error('Failed to load user history');
    } finally {
      setHistoryLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_country: formData.phone_country,
          phone_number: formData.phone_number,
          country: formData.country,
          city: formData.city,
          postal_code: formData.postal_code,
          zip_code: formData.zip_code,
          date_of_birth: formData.date_of_birth,
          birthday: formData.birthday,
          gender: formData.gender,
          role: formData.role,
          balance: formData.balance,
          referral_code: formData.referral_code,
          total_tasks_completed: formData.total_tasks_completed,
          total_withdraw: formData.total_withdraw,
          referral_earnings: formData.referral_earnings,
          full_name: `${formData.first_name || ''} ${formData.last_name || ''}`.trim() || formData.full_name
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('User profile updated successfully');
      onUpdate(formData);
      setEditing(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderInfoField = (label: string, value: any, name: keyof User, icon: any) => {
    const Icon = icon;
    return (
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
          <Icon className="h-3 w-3" />
          {label}
        </label>
        {editing ? (
          <Input 
            name={name}
            value={value || ''}
            onChange={handleChange}
            className="h-9 bg-black/40 border-white/5 focus:border-primary/50 text-sm font-mono"
          />
        ) : (
          <div className="h-9 flex items-center px-3 rounded-md bg-white/5 border border-transparent text-sm font-medium text-white">
            {value || 'N/A'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Button>
        <div className="flex items-center gap-3">
          {editing ? (
            <>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setEditing(false);
                  setFormData(user);
                }}
                className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="bg-primary text-black hover:bg-primary/90"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setEditing(true)}
              className="bg-white/5 border border-white/10 text-white hover:bg-white/10"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Summary */}
        <div className="space-y-6">
          <Card className="border-white/5 bg-[#0d0d0d] overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
            <CardContent className="relative pt-0">
              <div className="flex flex-col items-center -mt-12 text-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-primary/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Avatar className="h-24 w-24 border-4 border-[#0d0d0d] relative z-10">
                    <AvatarImage src={user.avatar_url || user.profile_image_url || user.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {user.first_name?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="mt-4 space-y-1">
                  <h2 className="text-2xl font-bold text-white">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 capitalize font-mono text-[10px] tracking-widest">
                    <Shield className="h-3 w-3 mr-1.5" />
                    {user.role}
                  </Badge>
                  <Badge variant="outline" className="bg-white/5 text-muted-foreground border-white/10 font-mono text-[10px] tracking-widest">
                    ID: {user.id.slice(0, 8)}
                  </Badge>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Balance</p>
                  <p className="text-lg font-bold text-emerald-500 font-mono">${user.balance.toFixed(2)}</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Earnings</p>
                  <p className="text-lg font-bold text-primary font-mono">${user.referral_earnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-[#0d0d0d]">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Tasks Completed</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">{user.total_tasks_completed}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-rose-500" />
                  <span className="text-xs text-muted-foreground">Total Withdrawals</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">${user.total_withdraw.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Member Since</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="bg-black/40 border border-white/5 p-1 h-12 w-full justify-start">
              <TabsTrigger value="basic" className="gap-2 h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-black font-mono text-[10px] uppercase tracking-widest transition-all">
                <UserIcon className="h-3 w-3" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2 h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-black font-mono text-[10px] uppercase tracking-widest transition-all">
                <TrendingUp className="h-3 w-3" />
                Account Stats
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-black font-mono text-[10px] uppercase tracking-widest transition-all">
                <History className="h-3 w-3" />
                Activity History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6 space-y-6">
              <Card className="border-white/5 bg-[#0d0d0d]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white">Identity & Contact</CardTitle>
                  <CardDescription>Core personnel identification data</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  {renderInfoField('First Name', formData.first_name, 'first_name', UserIcon)}
                  {renderInfoField('Last Name', formData.last_name, 'last_name', UserIcon)}
                  {renderInfoField('Email Address', formData.email, 'email', Mail)}
                  {renderInfoField('Phone Country', formData.phone_country, 'phone_country', Phone)}
                  {renderInfoField('Phone Number', formData.phone_number, 'phone_number', Phone)}
                  {renderInfoField('Gender', formData.gender, 'gender', UserIcon)}
                  {renderInfoField('Date of Birth', formData.date_of_birth, 'date_of_birth', Calendar)}
                  {renderInfoField('Birthday', formData.birthday, 'birthday', Calendar)}
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-[#0d0d0d]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white">Location & Security</CardTitle>
                  <CardDescription>Geographic and system access parameters</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  {renderInfoField('Country', formData.country, 'country', Globe)}
                  {renderInfoField('City', formData.city, 'city', MapPin)}
                  {renderInfoField('Postal Code', formData.postal_code, 'postal_code', MapPin)}
                  {renderInfoField('Zip Code', formData.zip_code, 'zip_code', MapPin)}
                  {renderInfoField('Referral Code', formData.referral_code, 'referral_code', Shield)}
                  {renderInfoField('Referred By', formData.referred_by, 'referred_by', Shield)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="mt-6 space-y-6">
              <Card className="border-white/5 bg-[#0d0d0d]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white">Financial Telemetry</CardTitle>
                  <CardDescription>Real-time capital and yield monitoring</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  {renderInfoField('Current Balance', formData.balance, 'balance', DollarSign)}
                  {renderInfoField('Referral Earnings', formData.referral_earnings, 'referral_earnings', TrendingUp)}
                  {renderInfoField('Total Withdrawn', formData.total_withdraw, 'total_withdraw', CreditCard)}
                  {renderInfoField('Tasks Completed', formData.total_tasks_completed, 'total_tasks_completed', CheckCircle2)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6 space-y-6">
              <Card className="border-white/5 bg-[#0d0d0d]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white">Task Submission History</CardTitle>
                  <CardDescription>Audit log of all personnel task engagements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-black/20">
                        <TableRow className="border-white/5">
                          <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Task Name</TableHead>
                          <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Reward</TableHead>
                          <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Status</TableHead>
                          <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyLoading ? (
                          Array(3).fill(0).map((_, i) => (
                            <TableRow key={i} className="border-white/5">
                              <TableCell colSpan={4} className="py-4"><Loader2 className="h-4 w-4 animate-spin mx-auto opacity-20" /></TableCell>
                            </TableRow>
                          ))
                        ) : submissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">No task history detected</TableCell>
                          </TableRow>
                        ) : (
                          submissions.map((sub) => (
                            <TableRow key={sub.id} className="border-white/5 hover:bg-white/[0.02]">
                              <TableCell className="font-medium text-white text-xs">{sub.tasks?.title}</TableCell>
                              <TableCell className="font-mono text-emerald-500 text-xs font-bold">${sub.tasks?.reward.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn(
                                  "text-[10px] font-mono uppercase tracking-tighter border-none",
                                  sub.status === 'approved' ? "text-emerald-500 bg-emerald-500/10" :
                                  sub.status === 'pending' ? "text-amber-500 bg-amber-500/10" : "text-rose-500 bg-rose-500/10"
                                )}>
                                  {sub.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] font-mono text-muted-foreground/60">
                                {new Date(sub.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-[#0d0d0d]">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white">Withdrawal History</CardTitle>
                  <CardDescription>Audit log of all capital distribution requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-black/20">
                        <TableRow className="border-white/5">
                          <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Amount</TableHead>
                          <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Method</TableHead>
                          <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Status</TableHead>
                          <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyLoading ? (
                          Array(3).fill(0).map((_, i) => (
                            <TableRow key={i} className="border-white/5">
                              <TableCell colSpan={4} className="py-4"><Loader2 className="h-4 w-4 animate-spin mx-auto opacity-20" /></TableCell>
                            </TableRow>
                          ))
                        ) : withdrawals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">No withdrawal history detected</TableCell>
                          </TableRow>
                        ) : (
                          withdrawals.map((w) => (
                            <TableRow key={w.id} className="border-white/5 hover:bg-white/[0.02]">
                              <TableCell className="font-mono text-rose-500 text-xs font-bold">${w.amount.toFixed(2)}</TableCell>
                              <TableCell className="text-white/80 text-xs uppercase font-mono tracking-tighter">{w.payment_method}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn(
                                  "text-[10px] font-mono uppercase tracking-tighter border-none",
                                  w.status === 'approved' ? "text-emerald-500 bg-emerald-500/10" :
                                  w.status === 'pending' ? "text-amber-500 bg-amber-500/10" : "text-rose-500 bg-rose-500/10"
                                )}>
                                  {w.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] font-mono text-muted-foreground/60">
                                {new Date(w.created_at).toLocaleDateString()}
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
      </div>
    </div>
  );
};
