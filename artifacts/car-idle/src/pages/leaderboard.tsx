import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { useGetLeaderboard, getGetLeaderboardQueryKey, useGetPlayerRank, getGetPlayerRankQueryKey, useSubmitScore } from "@workspace/api-client-react";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const RANK_TIERS: { name: string; threshold: number; color: string; icon: string }[] = [
  { name: "Rookie",                  threshold: 0,       color: "text-zinc-400",    icon: "🔩" },
  { name: "Thousands",               threshold: 1e3,     color: "text-zinc-300",    icon: "🔧" },
  { name: "Millions",                threshold: 1e6,     color: "text-green-400",   icon: "🚗" },
  { name: "Billions",                threshold: 1e9,     color: "text-cyan-400",    icon: "🏎️" },
  { name: "Trillions",               threshold: 1e12,    color: "text-blue-400",    icon: "🚀" },
  { name: "Quadrillions",            threshold: 1e15,    color: "text-indigo-400",  icon: "⭐" },
  { name: "Quintillions",            threshold: 1e18,    color: "text-violet-400",  icon: "🌙" },
  { name: "Sextillions",             threshold: 1e21,    color: "text-purple-400",  icon: "🪐" },
  { name: "Septillions",             threshold: 1e24,    color: "text-fuchsia-400", icon: "🌌" },
  { name: "Octillions",              threshold: 1e27,    color: "text-pink-400",    icon: "☀️" },
  { name: "Nonillions",              threshold: 1e30,    color: "text-rose-400",    icon: "🌟" },
  { name: "Decillions",              threshold: 1e33,    color: "text-amber-400",   icon: "💫" },
  { name: "Undecillions",            threshold: 1e36,    color: "text-yellow-400",  icon: "🔥" },
  { name: "Duodecillions",           threshold: 1e39,    color: "text-orange-400",  icon: "⚡" },
  { name: "Tredecillions",           threshold: 1e42,    color: "text-red-400",     icon: "🌀" },
  { name: "Quattuordecillions",      threshold: 1e45,    color: "text-emerald-300", icon: "💎" },
  { name: "Quindecillions",          threshold: 1e48,    color: "text-teal-300",    icon: "🏆" },
  { name: "Sexdecillions",           threshold: 1e51,    color: "text-sky-300",     icon: "👑" },
  { name: "Septendecillions",        threshold: 1e54,    color: "text-blue-300",    icon: "🦁" },
  { name: "Octodecillions",          threshold: 1e57,    color: "text-violet-300",  icon: "🐉" },
  { name: "Novemdecillions",         threshold: 1e60,    color: "text-purple-300",  icon: "🌈" },
  { name: "Vigintillions",           threshold: 1e63,    color: "text-fuchsia-300", icon: "⚔️" },
  { name: "Unvigintillions",         threshold: 1e66,    color: "text-pink-300",    icon: "🛡️" },
  { name: "Duovigintillions",        threshold: 1e69,    color: "text-rose-300",    icon: "🌙" },
  { name: "Trevigintillions",        threshold: 1e72,    color: "text-amber-300",   icon: "🔮" },
  { name: "Quattuorvigintillions",   threshold: 1e75,    color: "text-yellow-300",  icon: "🧿" },
  { name: "Quinvigintillions",       threshold: 1e78,    color: "text-lime-300",    icon: "🌍" },
  { name: "Sexvigintillions",        threshold: 1e81,    color: "text-green-300",   icon: "🌏" },
  { name: "Septenvigintillions",     threshold: 1e84,    color: "text-emerald-200", icon: "🌐" },
  { name: "Octovigintillions",       threshold: 1e87,    color: "text-teal-200",    icon: "🌠" },
  { name: "Novemvigintillions",      threshold: 1e90,    color: "text-cyan-200",    icon: "🌌" },
  { name: "Trigintillions",          threshold: 1e93,    color: "text-sky-200",     icon: "🪐" },
  { name: "Untrigintillions",        threshold: 1e96,    color: "text-blue-200",    icon: "⭐" },
  { name: "Duotrigintillions",       threshold: 1e99,    color: "text-indigo-200",  icon: "🌟" },
  { name: "Googol",                  threshold: 1e100,   color: "text-violet-200",  icon: "♾️" },
  { name: "Trestrigintillions",      threshold: 1e102,   color: "text-purple-200",  icon: "🔱" },
  { name: "Quattuortrigintillions",  threshold: 1e105,   color: "text-fuchsia-200", icon: "⚜️" },
  { name: "Infinity+",               threshold: 1e308,   color: "text-white",       icon: "🌌" },
];

export function getRankTitle(miles: number): typeof RANK_TIERS[0] {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (miles >= tier.threshold) current = tier;
    else break;
  }
  return current;
}

export default function Leaderboard() {
  const { state } = useGameState();
  const [tab, setTab] = useState("leaderboard");
  const submitScore = useSubmitScore();

  const { data: leaderboard, isLoading, refetch } = useGetLeaderboard(
    { limit: 50 },
    { query: { queryKey: getGetLeaderboardQueryKey({ limit: 50 }) } }
  );

  const { data: playerRank } = useGetPlayerRank(
    state.playerId,
    { query: { enabled: !!state.playerId, queryKey: getGetPlayerRankQueryKey(state.playerId) } }
  );

  const handleRefreshScore = () => {
    if (!state.playerName) return;
    submitScore.mutate({
      data: {
        playerId: state.playerId,
        playerName: state.playerName,
        totalMiles: state.totalMilesEver,
        prestigeLevel: state.prestigeLevel,
        carsOwned: state.ownedCars.length,
      }
    }, { onSuccess: () => refetch() });
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-zinc-300";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  const myRank = getRankTitle(state.totalMilesEver);
  const myRankIndex = RANK_TIERS.findIndex(t => t.name === myRank.name);
  const nextRank = RANK_TIERS[myRankIndex + 1];

  return (
    <div className="flex flex-col gap-6 animated-bg">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">Global Rankings</h1>
          <p className="text-muted-foreground mt-1">Top racers worldwide</p>
        </div>
        <Button
          onClick={handleRefreshScore}
          disabled={submitScore.isPending || !state.playerName}
          className="bg-primary text-primary-foreground font-bold uppercase tracking-wider"
        >
          {submitScore.isPending ? "Submitting..." : "Submit My Score"}
        </Button>
      </div>

      {/* Player rank card */}
      {playerRank && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-primary neon-text-primary">#{playerRank.rank}</div>
            <div>
              <div className="font-black text-white">{state.playerName}</div>
              <div className="text-xs text-muted-foreground">Your Rank</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-lg font-black ${myRank.color}`}>{myRank.icon} {myRank.name}</div>
              {nextRank && (
                <div className="text-[10px] text-muted-foreground">Next: {nextRank.icon} {nextRank.name}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-accent neon-text-accent">{formatNumber(state.totalMilesEver)}</div>
              <div className="text-xs text-muted-foreground">Total Miles</div>
            </div>
          </div>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card border border-border/50 p-1 flex gap-1 h-auto">
          <TabsTrigger value="leaderboard" className="font-bold uppercase tracking-wider text-[11px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            🏆 Leaderboard
          </TabsTrigger>
          <TabsTrigger value="tiers" className="font-bold uppercase tracking-wider text-[11px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            🎖️ Rank Tiers
          </TabsTrigger>
        </TabsList>

        {/* ── LEADERBOARD TAB ── */}
        <TabsContent value="leaderboard" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">Loading rankings...</div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <div className="text-muted-foreground">No scores yet. Be the first!</div>
              <Button onClick={handleRefreshScore} size="sm" className="bg-primary text-primary-foreground font-bold">
                Submit Score
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, i) => {
                const rank = i + 1;
                const isMe = entry.playerId === state.playerId;
                const entryRank = getRankTitle(entry.totalMiles);
                return (
                  <div
                    key={entry.id}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border transition-all
                      ${isMe
                        ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_hsl(0_90%_55%/0.15)]"
                        : rank <= 3
                          ? "border-border/60 bg-card/80"
                          : "border-border/30 bg-card/40"
                      }
                    `}
                  >
                    <div className={`w-10 text-center font-black text-lg ${getMedalColor(rank)}`}>
                      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-white truncate ${isMe ? "text-primary" : ""}`}>
                          {entry.playerName}
                        </span>
                        {isMe && <Badge variant="outline" className="text-[10px] border-primary/50 text-primary py-0 px-1.5">YOU</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className={entryRank.color}>{entryRank.icon} {entryRank.name}</span>
                        <span>·</span>
                        <span>{entry.carsOwned} cars · Prestige {entry.prestigeLevel}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-accent neon-text-accent">{formatNumber(entry.totalMiles)}</div>
                      <div className="text-xs text-muted-foreground">miles</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── RANK TIERS TAB ── */}
        <TabsContent value="tiers" className="mt-4">
          <div className="flex flex-col gap-2">
            {RANK_TIERS.map((tier, i) => {
              const isCurrentRank = myRank.name === tier.name;
              const isUnlocked = state.totalMilesEver >= tier.threshold;
              const nextTier = RANK_TIERS[i + 1];
              return (
                <div
                  key={tier.name}
                  className={`
                    flex items-center gap-4 p-3 rounded-xl border transition-all
                    ${isCurrentRank
                      ? "border-primary/60 bg-primary/10 shadow-[0_0_16px_hsl(0_90%_55%/0.2)]"
                      : isUnlocked
                        ? "border-border/50 bg-card/60"
                        : "border-border/20 bg-card/20 opacity-60"
                    }
                  `}
                >
                  <div className="text-2xl w-8 text-center">{tier.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-black text-sm ${isUnlocked ? tier.color : "text-muted-foreground"}`}>
                      {tier.name}
                      {isCurrentRank && (
                        <span className="ml-2 text-[9px] font-black text-primary border border-primary/40 px-1.5 py-0.5 rounded uppercase tracking-widest">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {tier.threshold === 0
                        ? "Starting rank"
                        : tier.threshold >= 1e308
                          ? "Reach the infinite"
                          : `Reach ${formatNumber(tier.threshold)} total miles`}
                    </div>
                  </div>
                  {isCurrentRank && nextTier && (
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-muted-foreground">Next</div>
                      <div className={`text-xs font-bold ${nextTier.color}`}>{nextTier.icon} {nextTier.name}</div>
                    </div>
                  )}
                  {isUnlocked && !isCurrentRank && (
                    <div className="text-primary text-xs font-black uppercase tracking-wider">✓</div>
                  )}
                  {!isUnlocked && (
                    <div className="text-muted-foreground text-xs">🔒</div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
