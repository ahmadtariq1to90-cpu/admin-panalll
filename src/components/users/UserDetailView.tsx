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
import { Skeleton } from '@/components/ui/skeleton';
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
    } catch (err: any) {
      console.error('Error fetching user history:', err);
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
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast.error(err.message || 'Failed to update user profile');
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
            className="h-10 bg-background border-border focus:border-primary/50 text-sm font-medium rounded-xl"
          />
        ) : (
          <div className="h-10 flex items-center px-4 rounded-xl bg-muted/30 border border-border/50 text-sm font-medium text-foreground">
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
          className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl h-10"
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
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-widest"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="bg-primary text-white hover:bg-primary/90 rounded-xl h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-sm"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setEditing(true)}
              className="bg-white border border-border text-foreground hover:bg-muted rounded-xl h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-sm"
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
          <Card className="border-border bg-card shadow-sm overflow-hidden rounded-2xl">
            <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5" />
            <CardContent className="relative pt-0">
              <div className="flex flex-col items-center -mt-12 text-center">
                <Avatar className="h-24 w-24 border-4 border-card shadow-xl">
                  <AvatarImage src={user.avatar_url || user.profile_image_url || user.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {user.first_name?.charAt(0) || user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-4 space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 capitalize font-bold text-[10px] tracking-widest px-3 py-1 rounded-full">
                    <Shield className="h-3 w-3 mr-1.5" />
                    {user.role}
                  </Badge>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-bold text-[10px] tracking-widest px-3 py-1 rounded-full">
                    ID: {user.id.slice(0, 8)}
                  </Badge>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border grid grid-cols-2 gap-4">
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Balance</p>
                  <p className="text-lg font-bold text-emerald-600">${user.balance.toFixed(2)}</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Earnings</p>
                  <p className="text-lg font-bold text-primary">${user.referral_earnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border py-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-muted-foreground">Tasks Completed</span>
                </div>
                <span className="text-sm font-bold text-foreground">{user.total_tasks_completed}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-rose-500" />
                  <span className="text-xs font-medium text-muted-foreground">Total Withdrawals</span>
                </div>
                <span className="text-sm font-bold text-foreground">${user.total_withdraw.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-muted-foreground">Member Since</span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="bg-muted/50 border border-border p-1 h-11 w-full justify-start rounded-xl">
              <TabsTrigger value="basic" className="gap-2 h-9 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg">
                <UserIcon className="h-3 w-3" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2 h-9 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg">
                <TrendingUp className="h-3 w-3" />
                Account Stats
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 h-9 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold text-[10px] uppercase tracking-widest transition-all rounded-lg">
                <History className="h-3 w-3" />
                Activity History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6 space-y-6">
              <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">Identity & Contact</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Core personnel identification data</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid gap-6 md:grid-cols-2">
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

              <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">Location & Security</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Geographic and system access parameters</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid gap-6 md:grid-cols-2">
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
              <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">Financial Telemetry</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Real-time capital and yield monitoring</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                  {renderInfoField('Current Balance', formData.balance, 'balance', DollarSign)}
                  {renderInfoField('Referral Earnings', formData.referral_earnings, 'referral_earnings', TrendingUp)}
                  {renderInfoField('Total Withdrawn', formData.total_withdraw, 'total_withdraw', CreditCard)}
                  {renderInfoField('Tasks Completed', formData.total_tasks_completed, 'total_tasks_completed', CheckCircle2)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6 space-y-6">
              <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">Task Submission History</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Audit log of all personnel task engagements</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow className="border-border">
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Task Name</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Reward</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Status</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyLoading ? (
                          Array(3).fill(0).map((_, i) => (
                            <TableRow key={i} className="border-border">
                              <TableCell colSpan={4} className="py-6"><Skeleton className="h-8 w-full bg-muted" /></TableCell>
                            </TableRow>
                          ))
                        ) : submissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground/40 font-bold text-[10px] uppercase tracking-widest">No task history detected</TableCell>
                          </TableRow>
                        ) : (
                          submissions.map((sub) => (
                            <TableRow key={sub.id} className="border-border hover:bg-muted/20 transition-colors">
                              <TableCell className="font-bold text-foreground text-xs">{sub.tasks?.title}</TableCell>
                              <TableCell className="font-bold text-emerald-600 text-xs">+${sub.tasks?.reward.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn(
                                  "text-[10px] font-bold uppercase tracking-widest border-none px-2 py-0.5 rounded-full",
                                  sub.status === 'approved' ? "text-emerald-600 bg-emerald-50" :
                                  sub.status === 'pending' ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50"
                                )}>
                                  {sub.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] font-medium text-muted-foreground">
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

              <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">Withdrawal History</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Audit log of all capital distribution requests</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow className="border-border">
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Amount</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Method</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Status</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyLoading ? (
                          Array(3).fill(0).map((_, i) => (
                            <TableRow key={i} className="border-border">
                              <TableCell colSpan={4} className="py-6"><Skeleton className="h-8 w-full bg-muted" /></TableCell>
                            </TableRow>
                          ))
                        ) : withdrawals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground/40 font-bold text-[10px] uppercase tracking-widest">No withdrawal history detected</TableCell>
                          </TableRow>
                        ) : (
                          withdrawals.map((w) => (
                            <TableRow key={w.id} className="border-border hover:bg-muted/20 transition-colors">
                              <TableCell className="font-bold text-rose-600 text-xs">-${w.amount.toFixed(2)}</TableCell>
                              <TableCell className="text-foreground text-xs font-bold uppercase tracking-widest">{w.payment_method}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn(
                                  "text-[10px] font-bold uppercase tracking-widest border-none px-2 py-0.5 rounded-full",
                                  w.status === 'approved' ? "text-emerald-600 bg-emerald-50" :
                                  w.status === 'pending' ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50"
                                )}>
                                  {w.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] font-medium text-muted-foreground">
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
