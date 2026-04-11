import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Wallet, 
  UsersRound, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'motion/react';

interface NavItemProps {
  key?: string | number;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <Button
    variant="ghost"
    className={cn(
      "w-full justify-start gap-3 px-4 py-5 text-sm font-medium transition-colors relative group rounded-lg",
      active 
        ? "text-primary bg-primary/5" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    )}
    onClick={onClick}
  >
    <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
    <span>{label}</span>
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full" />
    )}
  </Button>
);

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: any;
}

export const AdminLayout = ({ children, activeTab, setActiveTab, onLogout, user }: AdminLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'tasks', label: 'Task Pipeline', icon: CheckSquare },
    { id: 'withdrawals', label: 'Financials', icon: Wallet },
    { id: 'referrals', label: 'Network Graph', icon: UsersRound },
    { id: 'notifications', label: 'Broadcasts', icon: Bell },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-20 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground leading-none">PROTASK</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-1">Admin OS v2.4</span>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="flex flex-col p-4 gap-1">
          <div className="px-2 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Navigation</span>
          </div>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
            />
          ))}
          
          <div className="mt-8 px-2 space-y-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">System Status</span>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Core Engine</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Supabase</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Linked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border bg-muted/20">
        <div className="mb-4">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
              {user?.email?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-foreground truncate">{user?.email?.split('@')[0] || 'Administrator'}</span>
              <span className="text-[9px] font-medium text-muted-foreground truncate">System Admin</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 h-11 text-sm font-medium text-destructive hover:bg-destructive/5 hover:text-destructive transition-colors rounded-lg"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Terminate Session
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 lg:block sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-tight text-foreground">PROTASK</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="text-foreground" />}>
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-border w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
