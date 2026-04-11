import React from 'react';
import { 
  Search, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  Ban,
  TrendingUp,
  AlertCircle,
  RefreshCcw,
  Users
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { supabase, isUsingFallback } from '@/src/lib/supabase';
import { toast } from 'sonner';

export const UsersView = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const pageSize = 10;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;
      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [page, searchQuery]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success('User role updated');
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to update role');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          User Management
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">User Directory</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Manage system access, monitor activity, and adjust permissions for all personnel.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 h-11 bg-card border-border focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-muted/30 px-4 py-2 rounded-lg border border-border">
          <Users className="h-3 w-3" />
          Total Records: {totalCount}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3 text-rose-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div className="text-xs font-medium">
              <p className="font-bold uppercase tracking-wider mb-0.5">Database Error</p>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchUsers}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white border-rose-200 hover:bg-rose-50"
          >
            <RefreshCcw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </div>
      )}

      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Personnel</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Access Role</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Liquidity</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4">Enlistment Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-4 text-right">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-10 w-40 bg-muted" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 bg-muted" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 bg-muted" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 bg-muted" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto bg-muted" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground/40 font-bold text-[10px] uppercase tracking-widest">
                    No personnel records found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/20 transition-colors border-border group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border group-hover:border-primary/30 transition-colors">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                          <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{user.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{user.full_name || 'Anonymous'}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border-0",
                        user.role === 'admin' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {user.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-foreground">${(user.balance || 0).toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1 border-border bg-card shadow-lg">
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 py-1.5">Adjust Permissions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            className="text-xs font-medium focus:bg-primary/5 focus:text-primary cursor-pointer rounded-md"
                            onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                          >
                            <Shield className="h-3.5 w-3.5 mr-2" />
                            {user.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs font-medium focus:bg-rose-50 focus:text-rose-600 cursor-pointer rounded-md">
                            <Ban className="h-3.5 w-3.5 mr-2" />
                            Suspend Access
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
