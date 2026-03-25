import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Film, 
  Activity, 
  Database, 
  Cpu, 
  LayoutDashboard,
  PlusCircle,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/submit", label: "New Video", icon: PlusCircle },
  { path: "/jobs", label: "Jobs", icon: Film },
  { path: "/pipeline", label: "Pipeline Tools", icon: Activity },
  { path: "/checkpoints", label: "Checkpoints", icon: Database },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const NavLinks = ({ className = "" }: { className?: string }) => (
    <nav className={`space-y-2 ${className}`}>
      {NAV_ITEMS.map((item) => {
        const isActive = location === item.path;
        return (
          <Link key={item.path} href={item.path} className="block">
            <div className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
              ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
            `}>
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''}`} />
              <span className="font-medium relative z-10">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider">PIReel</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-card border-r-border">
            <div className="flex items-center gap-2 mb-8 mt-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Cpu className="w-5 h-5 text-black" />
              </div>
              <span className="font-display font-bold text-xl">PIReel</span>
            </div>
            <NavLinks />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/30 backdrop-blur-xl relative z-20 h-screen sticky top-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Cpu className="w-6 h-6 text-black" />
          </div>
          <span className="font-display font-bold text-2xl tracking-widest text-gradient">PIReel</span>
        </div>
        <div className="flex-1 py-6 px-4">
          <div className="mb-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </div>
          <NavLinks />
        </div>
        <div className="p-6 border-t border-white/5">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
            <div className="text-xs font-medium text-muted-foreground">
              L4 GPU <span className="text-foreground">Connected</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        {/* Background ambient glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
        
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
