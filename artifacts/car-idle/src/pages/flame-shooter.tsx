import { useState, useEffect, useRef, useCallback } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { CARS } from "@/lib/cars";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ── Scaling helpers ──────────────────────────────────────────────────────────

/** How many flames are 100% safe before risk starts */
function safeZone(mps: number): number {
  if (mps < 50)       return 6;
  if (mps < 500)      return 10;
  if (mps < 5_000)    return 14;
  if (mps < 50_000)   return 18;
  if (mps < 500_000)  return 24;
  if (mps < 5_000_000) return 30;
  if (mps < 50_000_000) return 38;
  return 50;
}

/** Break probability (0–1) after the safe zone, grows 4% per extra flame */
function breakChance(flames: number, safe: number): number {
  if (flames <= safe) return 0;
  const over = flames - safe;
  return Math.min(0.04 + (over - 1) * 0.04, 0.95);
}

/** Miles lost as a fraction of state.miles on failure */
function penaltyFraction(mps: number): number {
  if (mps < 50)        return 0.01;
  if (mps < 500)       return 0.015;
  if (mps < 5_000)     return 0.02;
  if (mps < 50_000)    return 0.03;
  if (mps < 500_000)   return 0.04;
  if (mps < 5_000_000) return 0.055;
  if (mps < 50_000_000) return 0.07;
  return 0.09;
}

/** Miles earned per flame on a clean stop */
function rewardPerFlame(mps: number): number {
  return Math.max(1, Math.floor(mps * 8));
}

// ── Unified car type ─────────────────────────────────────────────────────────

interface FlameCar {
  id: string;
  name: string;
  brand: string;
  mps: number;
  imagePath?: string;
  isCustom?: boolean;
  rarity: string;
}

// ── Component ────────────────────────────────────────────────────────────────

type Phase = "idle" | "shooting" | "cashed" | "blown";

export default function FlameShooter() {
  const { state, addBonusMiles } = useGameState();

  // Build car list: owned regular + owned custom
  const ownedUniqueIds = [...new Set(state.ownedCars)];
  const regularCars: FlameCar[] = ownedUniqueIds
    .map(id => CARS.find(c => c.id === id))
    .filter(Boolean)
    .map(c => ({
      id: c!.id,
      name: c!.name,
      brand: c!.brand,
      mps: c!.milesPerSecond,
      imagePath: c!.imagePath,
      rarity: c!.rarity,
    }));

  const ownedCustomIds = [...new Set(state.ownedCustomVehicles ?? [])];
  const customCars: FlameCar[] = ownedCustomIds
    .map(id => (state.customVehicles ?? []).find(v => v.id === id))
    .filter(Boolean)
    .map(v => ({
      id: v!.id,
      name: v!.name,
      brand: v!.brand,
      mps: v!.horsepower * 10,
      imagePath: v!.imagePath,
      isCustom: true,
      rarity: v!.rarity,
    }));

  const allCars: FlameCar[] = [...regularCars, ...customCars];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [flames, setFlames] = useState(0);
  const [result, setResult] = useState<{ reward?: number; penalty?: number } | null>(null);
  const [flameFlash, setFlameFlash] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedCar = selectedId ? allCars.find(c => c.id === selectedId) ?? null : null;
  const safe = selectedCar ? safeZone(selectedCar.mps) : 0;
  const risk = selectedCar ? breakChance(flames, safe) : 0;
  const heatPct = selectedCar
    ? Math.min((flames / (safe * 2.5)) * 100, 100)
    : 0;

  // ── shoot one flame ──────────────────────────────────────────────────────
  const shootFlame = useCallback(() => {
    if (phase !== "shooting" || !selectedCar) return;

    const nextFlames = flames + 1;

    // Flash animation
    setFlameFlash(true);
    setTimeout(() => setFlameFlash(false), 120);

    // Check for blow BEFORE incrementing so the roll applies to the new count
    const chance = breakChance(nextFlames, safeZone(selectedCar.mps));
    if (chance > 0 && Math.random() < chance) {
      // Blown
      const loss = Math.floor(state.miles * penaltyFraction(selectedCar.mps));
      addBonusMiles(-loss);
      setFlames(nextFlames);
      setResult({ penalty: loss });
      setPhase("blown");
      startCooldown();
      return;
    }

    setFlames(nextFlames);
  }, [phase, selectedCar, flames, state.miles, addBonusMiles]);

  // ── cash out ─────────────────────────────────────────────────────────────
  const cashOut = useCallback(() => {
    if (phase !== "shooting" || !selectedCar || flames === 0) return;
    const reward = flames * rewardPerFlame(selectedCar.mps);
    addBonusMiles(reward);
    setResult({ reward });
    setPhase("cashed");
    startCooldown();
  }, [phase, selectedCar, flames, addBonusMiles]);

  // ── start / reset ─────────────────────────────────────────────────────────
  function startSession() {
    if (!selectedCar || cooldown > 0) return;
    setFlames(0);
    setResult(null);
    setPhase("shooting");
  }

  function startCooldown() {
    setCooldown(30);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  // ── spacebar listener ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        shootFlame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shootFlame]);

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  // ── heat bar color ────────────────────────────────────────────────────────
  function heatColor(): string {
    if (heatPct < 40) return "#00cc66";
    if (heatPct < 65) return "#ffaa00";
    if (heatPct < 85) return "#ff6600";
    return "#ff2222";
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animated-bg">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white" style={{ textShadow: "0 0 20px #ff4400" }}>
          🔥 Flame Shooter
        </h1>
        <p className="text-muted-foreground mt-1">
          Press <kbd className="bg-secondary border border-border/60 rounded px-1.5 py-0.5 text-xs font-mono text-white">Space</kbd> to shoot flames. Stop before your cooling lines burst — or risk losing miles.
        </p>
      </div>

      {/* Risk legend */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="text-emerald-300 font-bold">Safe zone</span>
          <span className="text-muted-foreground">0% risk — shoot freely</span>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
          <span className="text-yellow-300 font-bold">Danger zone</span>
          <span className="text-muted-foreground">Risk grows +4% per flame</span>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          <span className="text-red-300 font-bold">Pricier cars</span>
          <span className="text-muted-foreground">More durable, higher penalty</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: car selector */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col gap-3">
          <h2 className="font-black uppercase tracking-wider text-white text-sm">Select Vehicle</h2>
          {allCars.length === 0 ? (
            <p className="text-muted-foreground text-sm">Buy vehicles from the Dealership first.</p>
          ) : (
            <div className="overflow-y-auto max-h-[420px] flex flex-col gap-1.5">
              {allCars.map(car => {
                const sz = safeZone(car.mps);
                const pf = Math.round(penaltyFraction(car.mps) * 100);
                return (
                  <button
                    key={car.id}
                    onClick={() => {
                      if (phase === "shooting") return;
                      setSelectedId(car.id);
                      setPhase("idle");
                      setFlames(0);
                      setResult(null);
                    }}
                    className={`
                      flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all
                      ${selectedId === car.id
                        ? "border-primary bg-primary/10 text-white"
                        : "border-border/40 bg-background/40 text-muted-foreground hover:border-border hover:text-white"}
                    `}
                  >
                    {car.imagePath ? (
                      <img src={car.imagePath} alt={car.name} className="w-10 h-7 object-cover rounded shrink-0" />
                    ) : (
                      <div className="text-xl w-10 text-center shrink-0">
                        {car.isCustom ? "🔧" : "🏎️"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs leading-tight truncate">{car.name}</div>
                      <div className="text-[10px] text-muted-foreground">{car.brand}</div>
                    </div>
                    <div className="text-right shrink-0 text-[10px]">
                      <div className="text-emerald-400 font-bold">{sz} safe</div>
                      <div className="text-red-400">−{pf}% on fail</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: flame panel */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col items-center gap-5">
          <h2 className="font-black uppercase tracking-wider text-white text-sm self-start">Flame Shooter</h2>

          {/* Car image */}
          {selectedCar && (
            <div
              className={`w-full max-w-xs h-36 rounded-xl overflow-hidden border-2 flex items-center justify-center transition-all duration-100 ${
                flameFlash
                  ? "border-orange-400 shadow-[0_0_40px_#ff6600]"
                  : phase === "blown"
                  ? "border-red-600 shadow-[0_0_20px_#ff0000]"
                  : "border-border/30"
              } bg-background/60`}
            >
              {selectedCar.imagePath ? (
                <img
                  src={selectedCar.imagePath}
                  alt={selectedCar.name}
                  className={`w-full h-full object-cover transition-all duration-100 ${flameFlash ? "brightness-150 saturate-200" : ""}`}
                />
              ) : (
                <div className={`text-7xl transition-all duration-100 ${flameFlash ? "scale-125" : ""}`}>
                  {flameFlash ? "🔥" : "🚗"}
                </div>
              )}
              {/* Flame overlay on shoot */}
              {flameFlash && (
                <div className="absolute inset-0 pointer-events-none rounded-xl"
                     style={{ background: "linear-gradient(to top, rgba(255,80,0,0.55), transparent)" }} />
              )}
            </div>
          )}

          {/* Flame counter */}
          {phase === "shooting" && (
            <div className="text-center">
              <div className="font-mono text-5xl font-black" style={{ color: heatColor(), textShadow: `0 0 20px ${heatColor()}` }}>
                {flames}
              </div>
              <div className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Flames Shot</div>
            </div>
          )}

          {/* Heat bar */}
          {phase === "shooting" && (
            <div className="w-full flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="uppercase tracking-wider">Heat</span>
                <span className={risk > 0 ? "font-bold text-red-400" : "text-emerald-400 font-bold"}>
                  {risk > 0 ? `${Math.round(risk * 100)}% break risk this flame` : `Safe zone (${safe - flames} left)`}
                </span>
              </div>
              <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${heatPct}%`,
                    background: heatColor(),
                    boxShadow: heatPct > 60 ? `0 0 10px ${heatColor()}` : undefined,
                  }}
                />
              </div>
              {/* Safe zone marker */}
              <div className="relative h-2">
                <div
                  className="absolute top-0 w-0.5 h-2 bg-emerald-500/60"
                  style={{ left: `${Math.min((safe / (safe * 2.5)) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats while shooting */}
          {phase === "shooting" && selectedCar && (
            <div className="grid grid-cols-2 gap-2 w-full text-xs">
              <div className="bg-background/60 rounded-lg p-2 text-center">
                <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Reward if stopped</div>
                <div className="font-black text-emerald-400">+{formatNumber(flames * rewardPerFlame(selectedCar.mps))}</div>
              </div>
              <div className="bg-background/60 rounded-lg p-2 text-center">
                <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Penalty if blown</div>
                <div className="font-black text-red-400">−{formatNumber(Math.floor(state.miles * penaltyFraction(selectedCar.mps)))}</div>
              </div>
            </div>
          )}

          {/* Outcome banners */}
          {phase === "cashed" && result?.reward !== undefined && (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-6 py-4 text-center w-full">
              <div className="text-3xl mb-1">🏆</div>
              <div className="text-emerald-400 font-black text-2xl">+{formatNumber(result.reward)} miles!</div>
              <div className="text-emerald-600 text-xs uppercase tracking-wider mt-1">{flames} flames — cooling lines intact!</div>
            </div>
          )}
          {phase === "blown" && result?.penalty !== undefined && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-6 py-4 text-center w-full">
              <div className="text-3xl mb-1">💥</div>
              <div className="text-red-400 font-black text-2xl">−{formatNumber(result.penalty)} miles</div>
              <div className="text-red-600 text-xs uppercase tracking-wider mt-1">{flames} flames — cooling lines burst!</div>
            </div>
          )}

          {/* Buttons */}
          <div className="w-full flex flex-col gap-2">
            {phase === "idle" && (
              cooldown > 0 ? (
                <div className="w-full text-center">
                  <div className="text-muted-foreground text-sm font-bold">Cooling down: {cooldown}s</div>
                  <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(cooldown / 30) * 100}%` }} />
                  </div>
                </div>
              ) : (
                <Button
                  onClick={startSession}
                  disabled={!selectedCar}
                  className="w-full font-black uppercase tracking-wider bg-orange-600 hover:bg-orange-500 text-white"
                >
                  🔥 Start Shooting
                </Button>
              )
            )}

            {phase === "shooting" && (
              <>
                {/* Big spacebar tap button for mobile */}
                <button
                  onPointerDown={e => { e.preventDefault(); shootFlame(); }}
                  className="w-full h-16 rounded-xl font-black uppercase tracking-wider text-lg text-white transition-all select-none active:scale-95"
                  style={{
                    background: flameFlash
                      ? "linear-gradient(135deg, #ff6600, #ff2200)"
                      : "linear-gradient(135deg, #cc3300, #991100)",
                    boxShadow: flameFlash ? "0 0 30px #ff4400" : "0 0 10px rgba(255,68,0,0.3)",
                  }}
                >
                  {flameFlash ? "🔥🔥🔥" : "🔥  SPACE / TAP TO SHOOT  🔥"}
                </button>
                <Button
                  onClick={cashOut}
                  disabled={flames === 0}
                  variant="outline"
                  className="w-full font-black uppercase tracking-wider border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                >
                  💰 Cash Out ({flames} flames)
                </Button>
              </>
            )}

            {(phase === "cashed" || phase === "blown") && (
              cooldown > 0 ? (
                <div className="w-full text-center">
                  <div className="text-muted-foreground text-sm font-bold">Cooling down: {cooldown}s</div>
                  <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(cooldown / 30) * 100}%` }} />
                  </div>
                </div>
              ) : (
                <Button
                  onClick={startSession}
                  className="w-full font-black uppercase tracking-wider bg-orange-600 hover:bg-orange-500 text-white"
                >
                  🔥 Go Again
                </Button>
              )
            )}
          </div>

          {/* Idle state — show car stats */}
          {phase === "idle" && selectedCar && (
            <div className="w-full grid grid-cols-2 gap-2 text-xs">
              <div className="bg-background/60 rounded-lg p-2 text-center">
                <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Safe Zone</div>
                <div className="font-black text-emerald-400">{safeZone(selectedCar.mps)} flames</div>
              </div>
              <div className="bg-background/60 rounded-lg p-2 text-center">
                <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Failure Penalty</div>
                <div className="font-black text-red-400">{Math.round(penaltyFraction(selectedCar.mps) * 100)}% of miles</div>
              </div>
              <div className="bg-background/60 rounded-lg p-2 text-center">
                <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Reward / Flame</div>
                <div className="font-black text-accent">{formatNumber(rewardPerFlame(selectedCar.mps))} mi</div>
              </div>
              <div className="bg-background/60 rounded-lg p-2 text-center">
                <div className="text-muted-foreground uppercase tracking-wider text-[9px]">Risk After Safe</div>
                <div className="font-black text-yellow-400">+4% / flame</div>
              </div>
            </div>
          )}

          {/* No car selected */}
          {!selectedCar && (
            <p className="text-muted-foreground text-sm text-center">Select a vehicle to begin.</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-card border border-border/50 rounded-xl p-4 text-xs text-muted-foreground">
        <p className="font-bold text-white mb-1">How Flame Shooter works</p>
        <p>
          Press <strong className="text-white">Space</strong> (or tap the fire button) to shoot flames from your exhaust.
          Each car has a safe zone where there's zero risk. Once you exceed it, every additional flame adds +4% break chance.
          Stop early to cash out — or keep going and risk your cooling lines bursting and losing miles.
          More expensive cars tolerate more heat, but the price of failure is steeper.
        </p>
      </div>
    </div>
  );
}
