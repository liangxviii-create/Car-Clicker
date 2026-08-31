import { Link, useLocation } from "wouter";
import { useGameState } from "@/hooks/use-game-state";
import { NamePrompt } from "@/components/name-prompt";
import { Trophy, Home, Car, Store, Skull, Gauge, ArrowRightLeft, Flag, Medal, Flame, Wrench, Zap, Gamepad2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { state, milesPerSecond } = useGameState();

  const navItems = [
    { href: "/", label: "Drive", icon: Home },
    { href: "/garage", label: "Garage", icon: Car },
    { href: "/dealership", label: "Shop", icon: Store },
    { href: "/dyno", label: "Dyno", icon: Gauge },
    { href: "/race", label: "Race", icon: Flag },
    { href: "/leaderboard", label: "Ranks", icon: Trophy },
    { href: "/trades", label: "Market", icon: ArrowRightLeft },
    { href: "/achievements", label: "Awards", icon: Medal },
    { href: "/challenges", label: "Challenges", icon: Flame },
    { href: "/custom-garage", label: "Custom", icon: Wrench },
    { href: "/flame-shooter", label: "Flames", icon: Zap },
    { href: "/arcade", label: "Arcade", icon: Gamepad2 },
    { href: "/prestige", label: "Rebirth", icon: Skull },
  ];

  const achievementCount = state.unlockedAchievements.length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <NamePrompt />

      {/* Top Header */}
      <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-black uppercase tracking-tighter text-primary neon-text-primary hidden sm:block">
            Vehicle Clicker
          </h1>
          {state.prestigeLevel > 0 && (
            <div className="text-[10px] font-black text-amber-500 border border-amber-500/40 px-1.5 py-0.5 rounded uppercase tracking-widest">
              Prestige {state.prestigeLevel}
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Miles</span>
            <span className="text-lg font-black text-white leading-none">{formatNumber(Math.floor(state.miles))}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Speed</span>
            <span className="text-base font-bold text-accent neon-text-accent leading-none">{formatNumber(milesPerSecond)} M/s</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden z-10 relative">
        {/* Sidebar Nav */}
        <nav className="w-14 lg:w-56 border-r border-border/50 bg-card/80 backdrop-blur-md flex flex-col py-3 gap-1 overflow-y-auto hidden md:flex shrink-0">
          {navItems.map((item) => {
            const active = location === item.href;
            const Icon = item.icon;
            const showBadge = item.href === "/achievements" && achievementCount > 0;

            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  relative flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-lg transition-all cursor-pointer group
                  ${active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-white"
                  }
                `}>
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary-foreground" : "group-hover:text-primary transition-colors"}`} />
                  <span className="font-bold uppercase tracking-wider text-xs hidden lg:block">{item.label}</span>
                  {showBadge && (
                    <span className="ml-auto text-[9px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full px-1.5 hidden lg:block">
                      {achievementCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden h-14 border-t border-border/50 bg-card/90 backdrop-blur-md z-50 flex items-center justify-around px-1">
        {[
          { href: "/", icon: Home },
          { href: "/garage", icon: Car },
          { href: "/dealership", icon: Store },
          { href: "/dyno", icon: Gauge },
          { href: "/race", icon: Flag },
          { href: "/leaderboard", icon: Trophy },
          { href: "/achievements", icon: Medal },
          { href: "/custom-garage", icon: Wrench },
          { href: "/flame-shooter", icon: Zap },
          { href: "/arcade", icon: Gamepad2 },
          { href: "/prestige", icon: Skull },
        ].map(({ href, icon: Icon }) => {
          const active = location === href;
          return (
            <Link key={href} href={href}>
              <div className={`p-2.5 rounded-xl transition-all ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <Icon className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
