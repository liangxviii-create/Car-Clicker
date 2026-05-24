import { useGameState } from "@/hooks/use-game-state";
import { useGetLeaderboard, getGetLeaderboardQueryKey, useGetPlayerRank, getGetPlayerRankQueryKey, useSubmitScore } from "@workspace/api-client-react";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Leaderboard() {
  const { state } = useGameState();
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

      {/* Player's rank */}
      {playerRank && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-primary neon-text-primary">#{playerRank.rank}</div>
            <div>
              <div className="font-black text-white">{state.playerName}</div>
              <div className="text-xs text-muted-foreground">Your Rank</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-accent neon-text-accent">{formatNumber(state.totalMilesEver)}</div>
            <div className="text-xs text-muted-foreground">Total Miles</div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
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
                  {rank === 1 ? "1" : rank === 2 ? "2" : rank === 3 ? "3" : `#${rank}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-white truncate ${isMe ? "text-primary" : ""}`}>
                      {entry.playerName}
                    </span>
                    {isMe && <Badge variant="outline" className="text-[10px] border-primary/50 text-primary py-0 px-1.5">YOU</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.carsOwned} cars · Prestige {entry.prestigeLevel}
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
    </div>
  );
}
