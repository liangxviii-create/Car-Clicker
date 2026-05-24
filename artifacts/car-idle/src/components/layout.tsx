import { Link, useLocation } from "wouter";
import { useGameState } from "@/hooks/use-game-state";
import { NamePrompt } from "@/components/name-prompt";
import { Trophy, Home, Car, Store, Skull, Target, ArrowRightLeft, Flag } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { state, milesPerSecond } = useGameState();

  const navItems = [
    { href: "/", label: "Drive", icon: Home },
    { href: "/garage", label: "Garage", icon: Car },
    { href: "/dealership", label: "Shop", icon: Store },
    { href: "/drift", label: "Drift", icon: Target },
    { href: "/race", label: "Race", icon: Flag },
    { href: "/leaderboard", label: "Ranks", icon: Trophy },
    { href: "/trades", label: "Market", icon: ArrowRightLeft },
    { href: "/prestige", label: "Rebirth", icon: Skull },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <div className="crt-overlay" />
      <div className="scanlines absolute inset-0 z-[1]" />
      
      <NamePrompt />
      
      {/* Top Header */}
      <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black uppercase tracking-tighter text-primary neon-text-primary hidden sm:block">
            RevMaster
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Miles</span>
            <span className="text-xl font-black text-white">{formatNumber(Math.floor(state.miles))}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Speed</span>
            <span className="text-lg font-bold text-accent neon-text-accent">{formatNumber(milesPerSecond)} M/s</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden z-10 relative">
        {/* Sidebar Nav */}
        <nav className="w-16 lg:w-64 border-r border-border/50 bg-card/80 backdrop-blur-md flex flex-col py-4 gap-2 overflow-y-auto hidden md:flex shrink-0">
          {navItems.map((item) => {
            const active = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  flex items-center gap-4 px-4 py-3 mx-2 rounded-md transition-all cursor-pointer group
                  ${active ? "bg-primary text-primary-foreground neon-border-primary" : "text-muted-foreground hover:bg-secondary hover:text-white"}
                `}>
                  <Icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "group-hover:text-primary transition-colors"}`} />
                  <span className="font-bold uppercase tracking-wider hidden lg:block">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="max-w-7xl mx-auto p-4 lg:p-8 h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden h-16 border-t border-border/50 bg-card/90 backdrop-blur-md z-50 flex items-center justify-around px-2 pb-safe">
        {navItems.slice(0, 5).map((item) => {
          const active = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`p-3 rounded-full transition-all ${active ? "bg-primary text-primary-foreground neon-border-primary" : "text-muted-foreground"}`}>
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
        <Link href="/menu">
          <div className={`p-3 rounded-full text-muted-foreground`}>
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <div className="h-0.5 bg-current w-full" />
              <div className="h-0.5 bg-current w-full" />
              <div className="h-0.5 bg-current w-full" />
            </div>
          </div>
        </Link>
      </nav>
    </div>
  );
}
