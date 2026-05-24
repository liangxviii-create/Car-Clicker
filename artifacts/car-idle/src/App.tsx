import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { GameProvider } from "@/hooks/use-game-state";
import Home from "@/pages/home";
import Garage from "@/pages/garage";
import Dealership from "@/pages/dealership";
import Drift from "@/pages/drift";
import Race from "@/pages/race";
import LeaderboardPage from "@/pages/leaderboard";
import Trades from "@/pages/trades";
import Prestige from "@/pages/prestige";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/garage" component={Garage} />
        <Route path="/dealership" component={Dealership} />
        <Route path="/drift" component={Drift} />
        <Route path="/race" component={Race} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/trades" component={Trades} />
        <Route path="/prestige" component={Prestige} />
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
