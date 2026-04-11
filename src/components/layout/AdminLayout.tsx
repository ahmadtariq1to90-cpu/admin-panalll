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
      "w-full justify-start gap-3 px-4 py-6 text-sm font-medium transition-all duration-300 relative group overflow-hidden rounded-none",
      active 
        ? "text-primary bg-primary/5 border-r-2 border-primary" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    )}
    onClick={onClick}
  >
    <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", active ? "text-primary" : "text-muted-foreground")} />
    <span className="relative z-10">{label}</span>
    {active && (
      <motion.div
        layoutId="active-nav"
        className="absolute inset-0 bg-primary/5 -z-10"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
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
    <div className="flex h-full flex-col bg-[#050505] border-r border-white/5">
      <div className="flex h-24 items-center px-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-primary/20 blur-sm rounded-lg" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-black border border-white/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white leading-none">PROTASK</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70 mt-1">Admin OS v2.4</span>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="flex flex-col py-4">
          <div className="px-6 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">Navigation</span>
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
          
          <div className="mt-10 px-6 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">System Status</span>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground/40 uppercase">Core Engine</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-500 uppercase">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground/40 uppercase">Supabase Link</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono text-emerald-500 uppercase">Encrypted</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground/40 uppercase">Latency</span>
                <span className="text-[10px] font-mono text-primary uppercase">24ms</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="mb-6 px-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-bold uppercase">
              {user?.email?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{user?.email?.split('@')[0] || 'Administrator'}</span>
              <span className="text-[10px] text-muted-foreground truncate">System Administrator</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-6 text-sm font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors rounded-xl"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          Terminate Session
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-foreground selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 lg:block sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[#0a0a0a]/80 px-6 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-tight text-white">PROTASK</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="text-white" />}>
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-white/5 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
