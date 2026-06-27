import { useState, useRef, useEffect } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { CARS } from "@/lib/cars";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DYNO_DURATION = 5000;

type DynoOutcome = "full" | "mid" | "blown";

function rollOutcome(): { outcome: DynoOutcome; targetProgress: number } {
  const roll = Math.random();
  if (roll < 0.28) {
    // Engine blow — goes past 90% then catastrophically drops
    return { outcome: "blown", targetProgress: 0.92 + Math.random() * 0.08 };
  } else if (roll < 0.55) {
    // Mid-rev stall — needle stalls between 45–70%
    return { outcome: "mid", targetProgress: 0.45 + Math.random() * 0.25 };
  } else {
    // Full pull success
    return { outcome: "full", targetProgress: 1.0 };
  }
}

export default function Dyno() {
  const { state, addBonusMiles } = useGameState();
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outcome, setOutcome] = useState<DynoOutcome | null>(null);
  const [reward, setReward] = useState<number | null>(null);
  const [penalty, setPenalty] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");

  const animRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const outcomeRef = useRef<{ outcome: DynoOutcome; targetProgress: number } | null>(null);
  const blownRef = useRef(false);

  const ownedUniqueIds = [...new Set(state.ownedCars)];
  const ownedCars = ownedUniqueIds.map(id => CARS.find(c => c.id === id)).filter(Boolean) as typeof CARS;

  const selectedCar = selectedCarId ? CARS.find(c => c.id === selectedCarId) ?? null : null;

  function calcFullReward(mps: number): number {
    return Math.floor(mps * 30 * 10);
  }

  function startDyno() {
    if (!selectedCar || running || cooldown > 0) return;
    setOutcome(null);
    setReward(null);
    setPenalty(null);
    setStatusMsg("");
    setRunning(true);
    setProgress(0);
    blownRef.current = false;

    const roll = rollOutcome();
    outcomeRef.current = roll;

    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      const { outcome: oc, targetProgress } = outcomeRef.current!;

      let p: number;

      if (oc === "full") {
        // Smooth ramp to 100%, slight jitter in the red zone
        p = Math.min(elapsed / DYNO_DURATION, 1);
        if (p > 0.75) {
          p = Math.min(p + (Math.random() - 0.5) * 0.015, 1);
        }
      } else if (oc === "mid") {
        // Builds up then suddenly stalls
        const rampTime = DYNO_DURATION * targetProgress;
        if (elapsed < rampTime) {
          p = elapsed / rampTime * targetProgress;
        } else {
          // Stalled — slight drop and hold
          const dropElapsed = elapsed - rampTime;
          p = targetProgress - Math.min(dropElapsed / 800, 1) * 0.06;
        }
      } else {
        // Blown — climbs fast to near redline, then rapid collapse
        const rampTime = DYNO_DURATION * 0.7;
        if (elapsed < rampTime) {
          p = elapsed / rampTime * targetProgress;
        } else if (!blownRef.current) {
          blownRef.current = true;
          p = targetProgress;
        } else {
          const dropElapsed = elapsed - rampTime;
          p = Math.max(targetProgress - dropElapsed / 600, 0);
        }
      }

      setProgress(Math.max(0, Math.min(p, 1)));

      const finished =
        (oc === "full" && p >= 1) ||
        (oc === "mid" && elapsed > DYNO_DURATION * targetProgress + 1200) ||
        (oc === "blown" && elapsed > DYNO_DURATION * 0.7 + 1500);

      if (!finished) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setRunning(false);
        setOutcome(oc);

        if (oc === "full") {
          const r = calcFullReward(selectedCar.milesPerSecond);
          setReward(r);
          addBonusMiles(r);
          setStatusMsg("🏁 Perfect pull! Full power measured!");
        } else if (oc === "mid") {
          const r = Math.floor(calcFullReward(selectedCar.milesPerSecond) * targetProgress * 0.35);
          setReward(r);
          addBonusMiles(r);
          setStatusMsg("⚠️ Engine stalled mid-pull. Partial reward only.");
        } else {
          // Engine blown — lose 5% of current miles
          const loss = Math.floor(state.miles * 0.05);
          setPenalty(loss);
          addBonusMiles(-loss);
          setStatusMsg("💥 ENGINE BLOWN! Repair costs deducted from your miles!");
        }

        // 45-second cooldown
        setCooldown(45);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // Gauge color: green → yellow → red → when blown flashes red
  function gaugeColor(p: number): string {
    if (outcome === "blown") return "#ff0000";
    if (p > 0.85) return "#ff2222";
    if (p > 0.6) return "#ffaa00";
    return "#00cc66";
  }

  const gaugeAngle = -135 + progress * 270;

  return (
    <div className="flex flex-col gap-6 animated-bg">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">
          🔧 Dyno Mode
        </h1>
        <p className="text-muted-foreground mt-1">
          Strap your vehicle to the dyno and pull. Engines can stall — or blow. Risk it for the reward.
        </p>
      </div>

      {/* Risk legend */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="text-emerald-300 font-bold">45% — Full Pull</span>
          <span className="text-muted-foreground">Full reward</span>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
          <span className="text-yellow-300 font-bold">27% — Mid Stall</span>
          <span className="text-muted-foreground">~35% reward</span>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          <span className="text-red-300 font-bold">28% — Engine Blow</span>
          <span className="text-muted-foreground">Lose 5% miles</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Car Selection */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col gap-3">
          <h2 className="font-black uppercase tracking-wider text-white text-sm">Select Vehicle</h2>
          {ownedCars.length === 0 ? (
            <p className="text-muted-foreground text-sm">Buy vehicles from the Dealership first.</p>
          ) : (
            <div className="overflow-y-auto max-h-[400px] flex flex-col gap-1.5">
              {ownedCars.map(car => (
                <button
                  key={car.id}
                  onClick={() => { setSelectedCarId(car.id); setOutcome(null); setReward(null); setPenalty(null); setStatusMsg(""); }}
                  className={`
                    flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all
                    ${selectedCarId === car.id
                      ? "border-primary bg-primary/10 text-white"
                      : "border-border/40 bg-background/40 text-muted-foreground hover:border-border hover:text-white"}
                  `}
                >
                  {car.imagePath ? (
                    <img src={car.imagePath} alt={car.name} className="w-10 h-7 object-cover rounded" />
                  ) : (
                    <div className="text-xl w-10 text-center">
                      {car.category === "aircraft" || car.category === "extreme_aircraft" ? "✈️"
                        : car.category === "missile" ? "🚀"
                        : car.category === "spacecraft" ? "🛸"
                        : car.category === "space_objects" ? "🌌"
                        : "🏎️"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs leading-tight truncate">{car.name}</div>
                    <div className="text-[10px] text-muted-foreground">{car.brand}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-accent font-bold">{formatNumber(car.milesPerSecond)}/s</div>
                    <div className="text-[9px] text-emerald-400">+{formatNumber(calcFullReward(car.milesPerSecond))}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dyno Panel */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col items-center gap-4">
          <h2 className="font-black uppercase tracking-wider text-white text-sm self-start">Dynamometer</h2>

          {/* Gauge */}
          <div className="relative w-56 h-40">
            <svg viewBox="0 0 200 130" className="w-full h-full">
              {/* Danger zone arc (red background) */}
              <path
                d="M 20 110 A 80 80 0 0 1 180 110"
                fill="none"
                stroke="#1a0000"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Danger zone highlight (85–100%) */}
              <path
                d="M 20 110 A 80 80 0 0 1 180 110"
                fill="none"
                stroke="#330000"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${0.85 * 251.3} 251.3`}
                strokeDashoffset={`${-0.85 * 251.3}`}
              />
              {/* Progress arc */}
              {progress > 0 && (
                <path
                  d="M 20 110 A 80 80 0 0 1 180 110"
                  fill="none"
                  stroke={gaugeColor(progress)}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 251.3} 251.3`}
                  style={{
                    filter: progress > 0.85 ? "drop-shadow(0 0 6px #ff4444)" : undefined,
                    transition: running ? "none" : undefined,
                  }}
                />
              )}
              {/* Needle */}
              <g transform={`rotate(${gaugeAngle}, 100, 110)`}
                 style={{ filter: outcome === "blown" ? "drop-shadow(0 0 4px red)" : undefined }}>
                <line x1="100" y1="110" x2="100" y2="38" stroke={outcome === "blown" ? "#ff0000" : "white"} strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="110" r="6" fill="#222" stroke={outcome === "blown" ? "#ff0000" : "white"} strokeWidth="2" />
              </g>
              {/* Labels */}
              <text x="18" y="127" fill="#666" fontSize="9" textAnchor="middle">0</text>
              <text x="100" y="22" fill="#666" fontSize="9" textAnchor="middle">MID</text>
              <text x="170" y="90" fill="#ff4444" fontSize="9" textAnchor="middle">🔥</text>
              <text x="182" y="127" fill="#ff4444" fontSize="9" textAnchor="middle">MAX</text>
            </svg>
          </div>

          {/* RPM-style live readout */}
          {running && (
            <div className="font-mono text-2xl font-black tracking-widest"
                 style={{ color: gaugeColor(progress) }}>
              {Math.round(progress * 9999).toString().padStart(4, "0")} RPM
            </div>
          )}

          {/* Selected car info */}
          {selectedCar && !running && outcome === null && (
            <div className="text-center">
              <div className="text-white font-black text-base">{selectedCar.name}</div>
              <div className="text-muted-foreground text-xs">{selectedCar.brand}</div>
              <div className="mt-1 text-accent font-bold text-sm">
                {formatNumber(selectedCar.milesPerSecond)} miles/s output
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Max reward: <span className="text-white font-bold">{formatNumber(calcFullReward(selectedCar.milesPerSecond))} miles</span>
              </div>
            </div>
          )}

          {/* Outcome display */}
          {outcome === "full" && reward !== null && (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-6 py-3 text-center w-full">
              <div className="text-emerald-400 font-black text-xl">+{formatNumber(reward)} miles!</div>
              <div className="text-emerald-600 text-xs uppercase tracking-wider mt-0.5">{statusMsg}</div>
            </div>
          )}
          {outcome === "mid" && reward !== null && (
            <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl px-6 py-3 text-center w-full">
              <div className="text-yellow-400 font-black text-xl">+{formatNumber(reward)} miles</div>
              <div className="text-yellow-600 text-xs uppercase tracking-wider mt-0.5">{statusMsg}</div>
            </div>
          )}
          {outcome === "blown" && penalty !== null && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-6 py-3 text-center w-full">
              <div className="text-red-400 font-black text-xl">−{formatNumber(penalty)} miles</div>
              <div className="text-red-600 text-xs uppercase tracking-wider mt-0.5">{statusMsg}</div>
            </div>
          )}

          {/* Cooldown / Button */}
          {cooldown > 0 ? (
            <div className="w-full text-center">
              <div className="text-muted-foreground text-sm font-bold">Cooling down: {cooldown}s</div>
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${(cooldown / 45) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <Button
              onClick={startDyno}
              disabled={!selectedCar || running}
              className="w-full font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {running
                ? `Pulling… ${Math.round(progress * 100)}%`
                : outcome !== null ? "🔧 Run Again" : "🔥 Run Dyno"}
            </Button>
          )}

          {running && (
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full transition-none"
                style={{
                  width: `${progress * 100}%`,
                  background: gaugeColor(progress),
                  boxShadow: progress > 0.85 ? "0 0 8px #ff4444" : undefined,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-card border border-border/50 rounded-xl p-4 text-xs text-muted-foreground">
        <p className="font-bold text-white mb-1">How Dyno Mode works</p>
        <p>Your vehicle is strapped to the dynamometer and runs a full pull — but nothing is guaranteed. 
        The engine might stall mid-rev for a partial reward, or blow entirely, costing you 5% of your miles. 
        Only 45% of pulls complete successfully. 45-second cooldown between runs. The most powerful vehicles earn the most — but also lose the most if they blow.</p>
      </div>
    </div>
  );
}
