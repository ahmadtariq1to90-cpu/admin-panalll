import React from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Trash2,
  Mail,
  Send
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
import { cn } from '@/lib/utils';

const mockNotifications = [
  { id: '1', type: 'success', title: 'Withdrawal Approved', message: 'User #123 withdrawal of $25.00 has been approved.', time: '2 mins ago', read: false },
  { id: '2', type: 'warning', title: 'New Task Submission', message: 'User #456 submitted "Follow on Twitter" for review.', time: '15 mins ago', read: false },
  { id: '3', type: 'info', title: 'System Update', message: 'The referral commission rate has been updated to 10%.', time: '1 hour ago', read: true },
  { id: '4', type: 'error', title: 'Payment Failed', message: 'Withdrawal request #789 failed due to invalid PayPal email.', time: '3 hours ago', read: true },
];

export const NotificationsView = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications Center</h1>
          <p className="text-muted-foreground">Manage system alerts and broadcast messages to users.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Mark All Read
          </Button>
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            New Broadcast
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {mockNotifications.map((notification) => (
            <Card key={notification.id} className={cn(
              "border-none shadow-xl shadow-black/5 backdrop-blur-sm transition-all hover:shadow-2xl",
              notification.read ? "bg-card/30" : "bg-card/70 border-l-4 border-primary"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "rounded-full p-2",
                    notification.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                    notification.type === 'warning' ? "bg-amber-100 text-amber-600" :
                    notification.type === 'error' ? "bg-rose-100 text-rose-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
                     notification.type === 'warning' ? <AlertCircle className="h-5 w-5" /> :
                     notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> :
                     <Info className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <span className="text-[10px] text-muted-foreground">{notification.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Broadcast Message</CardTitle>
              <CardDescription>Send a notification to all active users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
                <Input placeholder="System Maintenance..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Type your message here..."
                />
              </div>
              <Button className="w-full gap-2">
                <Send className="h-4 w-4" />
                Send Broadcast
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/50 shadow-xl shadow-black/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unread Alerts</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Broadcasts</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Failed Deliveries</span>
                <Badge variant="destructive">0</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
