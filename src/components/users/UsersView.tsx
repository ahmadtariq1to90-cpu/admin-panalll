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
  ChevronLeft
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
import { motion } from 'motion/react';
import { Profile } from '@/src/types';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';

export const UsersView = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user profiles, roles, and financial data.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Mail className="h-4 w-4" />
            Broadcast Email
          </Button>
        </div>
      </div>

      <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
        <CardHeader className="pb-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search users by name or email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl border bg-background/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                          <AvatarFallback>{user.full_name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{user.full_name || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? "default" : "secondary"} className="gap-1 capitalize">
                        {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono font-bold text-emerald-600">
                        <DollarSign className="h-3 w-3" />
                        {user.balance.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-xs font-bold text-primary">
                        {user.referral_code}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2">
                            <UserIcon className="h-4 w-4" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <DollarSign className="h-4 w-4" /> Edit Balance
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <UsersRound className="h-4 w-4" /> View Referrals
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Shield className="h-4 w-4" /> Suspend Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-bold text-foreground">{filteredUsers.length}</span> of <span className="font-bold text-foreground">{users.length}</span> users
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
