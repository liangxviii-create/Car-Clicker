import { useGameState } from "@/hooks/use-game-state";
import { CARS } from "@/lib/cars";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Prestige() {
  const { state, prestige } = useGameState();

  const required = 1000000 * Math.pow(10, state.prestigeLevel);
  const canPrestige = state.totalMilesEver >= required;
  const progress = Math.min((state.totalMilesEver / required) * 100, 100);
  const nextMultiplier = 1 + (state.prestigeLevel + 1) * 0.5;
  const currentMultiplier = 1 + state.prestigeLevel * 0.5;

  const PRESTIGE_REWARDS = [
    { level: 1, name: "Street Cred", desc: "x1.5 global multiplier" },
    { level: 2, name: "Underground King", desc: "x2.0 global multiplier + Ferrari SF90 unlocked" },
    { level: 3, name: "Drift Legend", desc: "x2.5 global multiplier + Bugatti Chiron unlocked" },
    { level: 5, name: "God of Speed", desc: "x3.5 global multiplier" },
    { level: 10, name: "RevMaster", desc: "x6.0 global multiplier" },
  ];

  return (
    <div className="flex flex-col gap-8 animated-bg max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight text-white">
          <span className="neon-text-primary">Prestige</span>
        </h1>
        <p className="text-muted-foreground mt-2">Reset your progress for permanent power multipliers.</p>
      </div>

      {/* Current status */}
      <div className="bg-card border border-border/40 rounded-2xl p-6 text-center">
        <div className="text-6xl font-black text-primary neon-text-primary mb-1">{state.prestigeLevel}</div>
        <div className="text-sm text-muted-foreground uppercase tracking-widest mb-4">Current Prestige Level</div>
        <div className="text-2xl font-bold text-accent neon-text-accent">{currentMultiplier}x</div>
        <div className="text-sm text-muted-foreground">Global Multiplier Active</div>
      </div>

      {/* Progress to next prestige */}
      <div className="bg-card border border-border/40 rounded-xl p-5 flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="font-bold text-white uppercase tracking-wider">Prestige {state.prestigeLevel + 1} Progress</span>
          <span className="text-muted-foreground">{Math.floor(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3 bg-background" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatNumber(state.totalMilesEver)} miles earned</span>
          <span>{formatNumber(required)} required</span>
        </div>
        {!canPrestige && (
          <div className="text-xs text-muted-foreground text-center">
            Need {formatNumber(required - state.totalMilesEver)} more miles
          </div>
        )}
      </div>

      {/* What resets */}
      <div className="bg-card border border-border/40 rounded-xl p-5">
        <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">What Resets</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Current Miles", value: formatNumber(Math.floor(state.miles)), resets: true },
            { label: "Cars Owned", value: `${new Set(state.ownedCars).size} cars`, resets: true },
            { label: "Click Count", value: formatNumber(state.clickCount), resets: true },
            { label: "Total Miles Ever", value: formatNumber(state.totalMilesEver), resets: false },
            { label: "Garage Customizations", value: "All styles kept", resets: false },
            { label: "Prestige Level", value: `→ ${state.prestigeLevel + 1}`, resets: false },
          ].map(item => (
            <div key={item.label} className={`flex items-center justify-between p-3 rounded-lg border ${item.resets ? "border-red-500/20 bg-red-500/5" : "border-green-400/20 bg-green-400/5"}`}>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-white">{item.value}</div>
                <div className={`text-xs font-bold ${item.resets ? "text-red-400" : "text-green-400"}`}>
                  {item.resets ? "RESET" : "KEPT"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What you gain */}
      <div className="bg-card border border-border/40 rounded-xl p-5">
        <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">What You Gain</div>
        <div className="flex items-center gap-4 p-4 bg-primary/10 border border-primary/30 rounded-xl">
          <div className="text-4xl font-black text-primary neon-text-primary">{nextMultiplier}x</div>
          <div>
            <div className="font-bold text-white">Global Speed Multiplier</div>
            <div className="text-sm text-muted-foreground">All miles (passive + click) multiplied permanently</div>
          </div>
        </div>

        {CARS.filter(c => c.unlockRequirement === `Prestige ${state.prestigeLevel + 1}`).map(car => (
          <div key={car.id} className="mt-3 flex items-center gap-3 p-3 bg-accent/10 border border-accent/30 rounded-xl">
            <svg viewBox="0 0 40 20" className="w-12" fill="none">
              <path d="M4 14 L6 7 Q12 4 20 4 Q28 4 34 7 L36 14 Z" fill="hsl(38 100% 55%)" />
              <circle cx="10" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
              <circle cx="30" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
            </svg>
            <div>
              <div className="font-bold text-accent">{car.name} Unlocked!</div>
              <div className="text-xs text-muted-foreground">{car.brand} · {formatNumber(car.milesPerSecond)}/s passive</div>
            </div>
          </div>
        ))}
      </div>

      {/* Prestige milestone table */}
      <div className="bg-card border border-border/40 rounded-xl p-5">
        <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Prestige Milestones</div>
        <div className="flex flex-col gap-2">
          {PRESTIGE_REWARDS.map(r => (
            <div key={r.level} className={`flex items-center gap-3 p-3 rounded-lg ${state.prestigeLevel >= r.level ? "border border-primary/30 bg-primary/5" : "border border-border/30"}`}>
              <div className={`font-black text-lg w-8 text-center ${state.prestigeLevel >= r.level ? "text-primary neon-text-primary" : "text-muted-foreground"}`}>
                {r.level}
              </div>
              <div className="flex-1">
                <div className={`font-bold text-sm ${state.prestigeLevel >= r.level ? "text-white" : "text-muted-foreground"}`}>{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </div>
              {state.prestigeLevel >= r.level && (
                <div className="text-xs text-primary font-bold uppercase tracking-wider">Unlocked</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prestige button */}
      <div className="sticky bottom-4 z-20">
        <Button
          onClick={prestige}
          disabled={!canPrestige}
          size="lg"
          className={`
            w-full text-xl font-black uppercase tracking-widest py-8 transition-all
            ${canPrestige
              ? "bg-primary text-primary-foreground neon-border-primary shadow-[0_0_40px_hsl(0_90%_55%/0.5)] hover:scale-[1.02] active:scale-[0.98]"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
            }
          `}
        >
          {canPrestige ? `Prestige Now! → Level ${state.prestigeLevel + 1}` : `Need ${formatNumber(required - state.totalMilesEver)} more miles`}
        </Button>
      </div>
    </div>
  );
}
