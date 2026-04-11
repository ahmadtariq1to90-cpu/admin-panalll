import React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Calendar, 
  DollarSign, 
  UsersRound,
  Shield,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  Eye,
  History,
  Ban,
  TrendingUp
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
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'motion/react';
import { User } from '@/src/types';
import { cn } from '@/lib/utils';
import { supabase, isUsingFallback } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { AlertCircle, RefreshCcw } from 'lucide-react';

import { UserDetailView } from './UserDetailView';

export const UsersView = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest' | 'highest_balance' | 'lowest_balance'>('newest');
  const [dateFilter, setDateFilter] = React.useState<'all' | '7days' | '30days' | 'custom'>('all');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('users').select('*');

      // Apply date filters
      if (dateFilter === '7days') {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        query = query.gte('created_at', date.toISOString());
      } else if (dateFilter === '30days') {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [dateFilter]);

  const filteredAndSortedUsers = React.useMemo(() => {
    let result = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest_balance':
        result.sort((a, b) => b.balance - a.balance);
        break;
      case 'lowest_balance':
        result.sort((a, b) => a.balance - b.balance);
        break;
    }

    return result;
  }, [users, searchTerm, sortBy]);

  if (selectedUser) {
    return (
      <UserDetailView 
        user={selectedUser} 
        onBack={() => setSelectedUser(null)} 
        onUpdate={(updatedUser) => {
          setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          setSelectedUser(updatedUser);
        }}
      />
    );
  }

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
            onClick={fetchUsers}
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
          Directory Access Granted
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Personnel Database</h1>
        <p className="text-muted-foreground max-w-2xl">
          Manage system participants, monitor financial standing, and oversee account integrity.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md group">
          <div className="absolute -inset-1 bg-primary/20 blur-sm rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input 
            placeholder="Filter by name, email, or ID..." 
            className="pl-10 bg-[#0d0d0d] border-white/5 focus:border-primary/50 transition-all relative z-10 font-mono text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white hover:bg-white/5 border border-white/5">
                <Filter className="h-3 w-3 mr-2" />
                Time: {dateFilter === 'all' ? 'All Time' : dateFilter === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-black border-white/10 text-white">
              <DropdownMenuItem onClick={() => setDateFilter('all')} className="text-xs font-mono uppercase tracking-widest cursor-pointer">All Time</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter('7days')} className="text-xs font-mono uppercase tracking-widest cursor-pointer">Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter('30days')} className="text-xs font-mono uppercase tracking-widest cursor-pointer">Last 30 Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white hover:bg-white/5 border border-white/5">
                <TrendingUp className="h-3 w-3 mr-2" />
                Sort: {sortBy.replace('_', ' ')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black border-white/10 text-white">
              <DropdownMenuItem onClick={() => setSortBy('newest')} className="text-xs font-mono uppercase tracking-widest cursor-pointer">Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')} className="text-xs font-mono uppercase tracking-widest cursor-pointer">Oldest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('highest_balance')} className="text-xs font-mono uppercase tracking-widest cursor-pointer">Highest Balance</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('lowest_balance')} className="text-xs font-mono uppercase tracking-widest cursor-pointer">Lowest Balance</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="h-10 bg-primary text-black hover:bg-primary/90 text-[10px] font-bold uppercase tracking-widest px-6">
            <Mail className="h-3 w-3 mr-2" />
            Broadcast
          </Button>
        </div>
      </div>

      <Card className="border-white/5 bg-[#0d0d0d] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40 border-b border-white/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Personnel</TableHead>
                <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Security Level</TableHead>
                <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Financials</TableHead>
                <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Access Key</TableHead>
                <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 py-4">Deployment</TableHead>
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
              ) : filteredAndSortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center text-muted-foreground/40 font-mono text-xs uppercase tracking-widest">
                    No personnel records found matching criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-primary/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Avatar className="h-10 w-10 border border-white/10 relative z-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{user.full_name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">{user.full_name || 'Anonymous'}</span>
                          <span className="text-[10px] font-mono text-muted-foreground/60">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "gap-1.5 capitalize font-mono text-[10px] tracking-wider border-white/5 bg-black/40",
                        user.role === 'admin' ? "text-primary border-primary/20" : "text-muted-foreground/60"
                      )}>
                        {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono font-bold text-emerald-500 text-sm">
                        <DollarSign className="h-3 w-3 opacity-50" />
                        {user.balance.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="rounded-md bg-black border border-white/5 px-2 py-1 text-[10px] font-mono font-bold text-primary/80">
                          {user.referral_code}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/60">
                          <Calendar className="h-3 w-3 opacity-40" />
                          {new Date(user.created_at).toLocaleDateString()}
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
                          <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Personnel Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem 
                            className="gap-3 text-xs font-medium focus:bg-white/5 focus:text-primary cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                          >
                            <UserIcon className="h-4 w-4 opacity-60" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 text-xs font-medium focus:bg-white/5 focus:text-primary cursor-pointer">
                            <DollarSign className="h-4 w-4 opacity-60" /> Adjust Balance
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 text-xs font-medium focus:bg-white/5 focus:text-primary cursor-pointer">
                            <UsersRound className="h-4 w-4 opacity-60" /> Referral Network
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem className="gap-3 text-xs font-medium focus:bg-rose-500/10 focus:text-rose-500 cursor-pointer text-rose-500/80">
                            <Shield className="h-4 w-4 opacity-60" /> Revoke Access
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
            Showing <span className="text-white font-bold">{filteredAndSortedUsers.length}</span> of <span className="text-white font-bold">{users.length}</span> personnel records
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
    </div>
  );
};
