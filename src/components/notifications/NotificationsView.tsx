import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Send,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const mockNotifications = [
  { id: '1', type: 'success', title: 'Withdrawal Approved', message: 'User #123 withdrawal of $25.00 has been approved.', time: '2 mins ago', read: false },
  { id: '2', type: 'warning', title: 'New Task Submission', message: 'User #456 submitted "Follow on Twitter" for review.', time: '15 mins ago', read: false },
  { id: '3', type: 'info', title: 'System Update', message: 'The referral commission rate has been updated to 10%.', time: '1 hour ago', read: true },
  { id: '4', type: 'error', title: 'Payment Failed', message: 'Withdrawal request #789 failed due to invalid PayPal email.', time: '3 hours ago', read: true },
];

export const NotificationsView = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            System Alerts
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications Center</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Manage system alerts and broadcast messages to users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest border-border hover:bg-muted">
            <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Recent Activity</h3>
            <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[10px] font-bold">
              {mockNotifications.filter(n => !n.read).length} Unread
            </Badge>
          </div>
          {mockNotifications.map((notification) => (
            <Card key={notification.id} className={cn(
              "border-border shadow-sm transition-all hover:shadow-md group relative overflow-hidden",
              notification.read ? "bg-card/50" : "bg-card border-l-4 border-l-primary"
            )}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "rounded-xl p-2.5",
                    notification.type === 'success' ? "bg-emerald-50 text-emerald-600" :
                    notification.type === 'warning' ? "bg-amber-50 text-amber-600" :
                    notification.type === 'error' ? "bg-rose-50 text-rose-600" :
                    "bg-blue-50 text-blue-600"
                  )}>
                    {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
                     notification.type === 'warning' ? <AlertCircle className="h-5 w-5" /> :
                     notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> :
                     <Info className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground">{notification.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {notification.time}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{notification.message}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" />}>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 p-1 border-border bg-card shadow-lg">
                      <DropdownMenuItem className="text-xs font-medium focus:bg-primary focus:text-white cursor-pointer rounded-md">
                        Mark as Read
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs font-medium focus:bg-rose-50 focus:text-rose-600 cursor-pointer rounded-md">
                        Delete Alert
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Broadcast Message</h3>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">Send a notification to all active users</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Title</label>
                <Input placeholder="System Maintenance..." className="h-11 bg-background border-border focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Message</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Type your message here..."
                />
              </div>
              <Button className="w-full h-11 gap-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm">
                <Send className="h-4 w-4" />
                Send Broadcast
              </Button>
            </div>
          </Card>

          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Quick Stats</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Unread Alerts</span>
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Active Broadcasts</span>
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Failed Deliveries</span>
                <Badge variant="outline" className="text-rose-600 border-rose-100 bg-rose-50 font-bold">0</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
