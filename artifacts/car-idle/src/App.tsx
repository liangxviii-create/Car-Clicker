import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { GameProvider, setAchievementToastFn, useGameState } from "@/hooks/use-game-state";
import Home from "@/pages/home";
import Garage from "@/pages/garage";
import Dealership from "@/pages/dealership";
import Dyno from "@/pages/dyno";
import Race from "@/pages/race";
import LeaderboardPage from "@/pages/leaderboard";
import Trades from "@/pages/trades";
import Prestige from "@/pages/prestige";
import Achievements from "@/pages/achievements";
import Challenges from "@/pages/challenges";
import CustomGarage from "@/pages/custom-garage";
import FlameShooter from "@/pages/flame-shooter";
import Arcade from "@/pages/arcade";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { formatNumber } from "@/lib/utils";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

function ToastBridge() {
  const { toast } = useToast();
  useEffect(() => {
    setAchievementToastFn((title, description) => {
      toast({ title, description });
    });
    return () => setAchievementToastFn(null);
  }, [toast]);
  return null;
}

function OfflineEarningsModal() {
  const { offlineEarnings, dismissOfflineEarnings } = useGameState();
  if (!offlineEarnings) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border/60 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="text-5xl mb-4">💤</div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
          Welcome Back!
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Your fleet kept running while you were away at 70% efficiency.
        </p>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-4 mb-6">
          <div className="text-3xl font-black text-emerald-400">
            +{formatNumber(offlineEarnings)}
          </div>
          <div className="text-emerald-600 text-xs uppercase tracking-wider mt-1">Offline Miles Earned</div>
        </div>
        <button
          onClick={dismissOfflineEarnings}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-wider py-3 rounded-xl transition-colors"
        >
          Collect & Continue
        </button>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <OfflineEarningsModal />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/garage" component={Garage} />
        <Route path="/dealership" component={Dealership} />
        <Route path="/dyno" component={Dyno} />
        <Route path="/race" component={Race} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/trades" component={Trades} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/challenges" component={Challenges} />
        <Route path="/prestige" component={Prestige} />
        <Route path="/custom-garage" component={CustomGarage} />
        <Route path="/flame-shooter" component={FlameShooter} />
        <Route path="/arcade" component={Arcade} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <ToastBridge />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </GameProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
