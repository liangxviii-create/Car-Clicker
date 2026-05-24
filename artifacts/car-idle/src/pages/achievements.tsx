import { useGameState } from "@/hooks/use-game-state";
import { ACHIEVEMENTS, type Achievement } from "@/lib/achievements";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<Achievement["category"], string> = {
  collection: "Collection",
  driving: "Driving",
  racing: "Racing",
  prestige: "Prestige",
  social: "Social",
  milestone: "Milestones",
};

const CATEGORY_ORDER: Achievement["category"][] = [
  "milestone",
  "collection",
  "driving",
  "racing",
  "prestige",
  "social",
];

export default function Achievements() {
  const { state } = useGameState();
  const unlocked = new Set(state.unlockedAchievements);
  const totalUnlocked = state.unlockedAchievements.length;
  const total = ACHIEVEMENTS.filter(a => !a.secret || unlocked.has(a.id)).length;

  const grouped = CATEGORY_ORDER.reduce<Record<string, Achievement[]>>((acc, cat) => {
    acc[cat] = ACHIEVEMENTS.filter(a => a.category === cat && (!a.secret || unlocked.has(a.id)));
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8 animated-bg">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">Achievements</h1>
        <p className="text-muted-foreground mt-1">
          <span className="text-accent font-bold neon-text-accent">{totalUnlocked}</span>
          <span className="text-muted-foreground"> / {total} unlocked</span>
        </p>

        {/* Overall progress bar */}
        <div className="mt-3 h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(2, (totalUnlocked / Math.max(total, 1)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      {CATEGORY_ORDER.map(cat => {
        const achs = grouped[cat];
        if (!achs || achs.length === 0) return null;
        const catUnlocked = achs.filter(a => unlocked.has(a.id)).length;

        return (
          <div key={cat}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                {CATEGORY_LABELS[cat]}
              </h2>
              <span className="text-xs text-muted-foreground font-bold">
                {catUnlocked}/{achs.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {achs.map(ach => {
                const isUnlocked = unlocked.has(ach.id);

                return (
                  <div
                    key={ach.id}
                    className={cn(
                      "relative rounded-xl border p-4 flex items-center gap-3 transition-all",
                      isUnlocked
                        ? "border-primary/40 bg-primary/8 shadow-[0_0_15px_hsl(0_90%_55%/0.1)]"
                        : "border-border/30 bg-card/40 opacity-60 grayscale"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border",
                      isUnlocked
                        ? "bg-primary/15 border-primary/30"
                        : "bg-secondary/50 border-border/20"
                    )}>
                      {ach.secret && !isUnlocked ? "❓" : ach.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-bold text-sm leading-tight",
                        isUnlocked ? "text-white" : "text-muted-foreground"
                      )}>
                        {ach.secret && !isUnlocked ? "???" : ach.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                        {ach.secret && !isUnlocked ? "Complete a secret challenge" : ach.description}
                      </div>
                    </div>

                    {/* Unlocked badge */}
                    {isUnlocked && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(0_90%_55%/0.8)]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
