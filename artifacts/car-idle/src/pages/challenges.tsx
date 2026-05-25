import { useGameState } from "@/hooks/use-game-state";
import { formatNumber } from "@/lib/utils";
import { getDailyDateKey } from "@/lib/challenges";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, string> = {
  clicks:      "🖱️",
  drift_score: "🌀",
  race_wins:   "🏆",
  earn_miles:  "💨",
  buy_cars:    "🚗",
  buy_category:"🏪",
};

const TYPE_LABELS: Record<string, string> = {
  clicks:      "Clicking",
  drift_score: "Drift",
  race_wins:   "Racing",
  earn_miles:  "Miles",
  buy_cars:    "Shopping",
  buy_category:"Shopping",
};

export default function Challenges() {
  const { state } = useGameState();
  const todayKey = getDailyDateKey();
  const challenges = state.dailyChallenges;
  const completedCount = challenges.filter(c => c.completed).length;
  const totalReward = challenges.reduce((acc, c) => acc + c.reward, 0);
  const earnedReward = challenges.filter(c => c.completed).reduce((acc, c) => acc + c.reward, 0);

  // Time until next reset
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msLeft = tomorrow.getTime() - now.getTime();
  const hLeft = Math.floor(msLeft / 3600000);
  const mLeft = Math.floor((msLeft % 3600000) / 60000);

  return (
    <div className="flex flex-col gap-8 animated-bg max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">
          Daily Challenges
        </h1>
        <p className="text-muted-foreground mt-1">
          Resets in <span className="text-accent font-bold">{hLeft}h {mLeft}m</span>
          {" · "}
          <span className="text-white font-bold">{completedCount}/3</span> completed
          {" · "}
          <span className="text-accent font-bold">{formatNumber(totalReward)}</span> total reward
        </p>

        {/* Overall progress */}
        <div className="mt-3 h-2.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* All 3 complete bonus */}
      {completedCount === 3 && (
        <div className="p-4 rounded-xl border-2 border-green-400/50 bg-green-400/10 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <div className="font-black text-green-400 uppercase tracking-wider">All challenges complete!</div>
          <div className="text-sm text-muted-foreground mt-1">You earned {formatNumber(earnedReward)} bonus miles today</div>
        </div>
      )}

      {/* Challenge cards */}
      <div className="flex flex-col gap-4">
        {challenges.map((challenge, idx) => {
          const pct = Math.min((challenge.progress / challenge.target) * 100, 100);
          const icon = TYPE_ICONS[challenge.type] || "🎯";
          const label = TYPE_LABELS[challenge.type] || "Challenge";

          return (
            <div
              key={challenge.id}
              className={cn(
                "rounded-2xl border p-5 flex flex-col gap-4 transition-all",
                challenge.completed
                  ? "border-green-400/40 bg-green-400/5 shadow-[0_0_20px_hsl(142_70%_50%/0.1)]"
                  : "border-border/50 bg-card"
              )}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shrink-0",
                    challenge.completed
                      ? "bg-green-400/15 border-green-400/30"
                      : "bg-background/60 border-border/40"
                  )}>
                    {challenge.completed ? "✅" : icon}
                  </div>
                  <div>
                    <div className={cn(
                      "font-black text-base leading-tight",
                      challenge.completed ? "text-green-400" : "text-white"
                    )}>
                      {challenge.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">
                      {label} challenge · Day {idx + 1}
                    </div>
                  </div>
                </div>

                {/* Reward */}
                <div className="text-right shrink-0">
                  <div className={cn(
                    "text-lg font-black",
                    challenge.completed ? "text-green-400" : "text-accent neon-text-accent"
                  )}>
                    +{formatNumber(challenge.reward)}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">miles</div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>
                    {formatNumber(Math.min(challenge.progress, challenge.target))} / {formatNumber(challenge.target)}
                  </span>
                  <span className={challenge.completed ? "text-green-400 font-bold" : ""}>
                    {challenge.completed ? "COMPLETE!" : `${Math.floor(pct)}%`}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-background overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      challenge.completed
                        ? "bg-green-400"
                        : "bg-gradient-to-r from-primary to-amber-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* How to complete hint */}
              {!challenge.completed && (
                <div className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>
                    {challenge.type === "clicks" && "Click your car on the Drive screen"}
                    {challenge.type === "drift_score" && "Play Drift Mode and hit corners in the right lane"}
                    {challenge.type === "race_wins" && "Win Street Races by shifting at the right RPM"}
                    {challenge.type === "earn_miles" && "Idle or click — miles accumulate automatically"}
                    {challenge.type === "buy_cars" && "Purchase cars from the Dealership"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <div className="bg-card border border-border/30 rounded-xl p-4 text-sm text-muted-foreground">
        <div className="font-bold text-white mb-2 uppercase tracking-wider text-xs">How It Works</div>
        <ul className="flex flex-col gap-1.5 list-disc list-inside text-xs">
          <li>3 new challenges generate every day at midnight</li>
          <li>Progress is tracked automatically as you play</li>
          <li>Completing a challenge instantly rewards you with bonus miles</li>
          <li>Completing all 3 shows off your dedication</li>
        </ul>
      </div>
    </div>
  );
}
