import { useState, useRef, useEffect } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { CARS } from "@/lib/cars";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DYNO_DURATION = 4000; // ms for the dyno pull animation

export default function Dyno() {
  const { state, addBonusMiles } = useGameState();
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reward, setReward] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ownedUniqueIds = [...new Set(state.ownedCars)];
  const ownedCars = ownedUniqueIds.map(id => CARS.find(c => c.id === id)).filter(Boolean) as typeof CARS;

  const selectedCar = selectedCarId
    ? CARS.find(c => c.id === selectedCarId) ?? null
    : null;

  // Calculate the dyno reward: based on milesPerSecond (proxy for HP/thrust)
  function calcReward(mps: number): number {
    // Dyno reward = 30 seconds of this car's passive output at 10× multiplier
    return Math.floor(mps * 30 * 10);
  }

  function startDyno() {
    if (!selectedCar || running || cooldown > 0) return;
    setReward(null);
    setRunning(true);
    setProgress(0);

    startRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      const p = Math.min(elapsed / DYNO_DURATION, 1);
      setProgress(p);
      if (p < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setRunning(false);
        const r = calcReward(selectedCar.milesPerSecond);
        setReward(r);
        addBonusMiles(r);
        // 30-second cooldown
        setCooldown(30);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(cooldownRef.current!);
              return 0;
            }
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

  const gaugeAngle = -135 + progress * 270; // from -135° to +135°

  return (
    <div className="flex flex-col gap-6 animated-bg">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">
          🏎️ Dyno Mode
        </h1>
        <p className="text-muted-foreground mt-1">
          Strap your vehicle to the dyno and score miles based on raw power output.
        </p>
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
                  onClick={() => setSelectedCarId(car.id)}
                  className={`
                    flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all
                    ${selectedCarId === car.id
                      ? "border-primary bg-primary/10 text-white"
                      : "border-border/40 bg-background/40 text-muted-foreground hover:border-border hover:text-white"}
                  `}
                >
                  <div className="text-xl">
                    {car.category === "aircraft" || car.category === "extreme_aircraft" ? "✈️"
                      : car.category === "missile" ? "🚀"
                      : car.category === "spacecraft" ? "🛸"
                      : car.category === "space_objects" ? "🌌"
                      : "🏎️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs leading-tight truncate">{car.name}</div>
                    <div className="text-[10px] text-muted-foreground">{car.brand}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-accent font-bold">{formatNumber(car.milesPerSecond)}/s</div>
                    <div className="text-[9px] text-muted-foreground">
                      +{formatNumber(calcReward(car.milesPerSecond))} mi
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dyno Panel */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col items-center gap-6">
          <h2 className="font-black uppercase tracking-wider text-white text-sm self-start">Dynamometer</h2>

          {/* Gauge */}
          <div className="relative w-52 h-36">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              {/* Background arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#333"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Progress arc */}
              {progress > 0 && (
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={progress > 0.8 ? "#ff2222" : progress > 0.5 ? "#ffaa00" : "#00cc66"}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 251.3} 251.3`}
                />
              )}
              {/* Needle */}
              <g transform={`rotate(${gaugeAngle}, 100, 100)`}>
                <line x1="100" y1="100" x2="100" y2="30" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="100" r="6" fill="#333" stroke="white" strokeWidth="2" />
              </g>
              {/* RPM labels */}
              <text x="18" y="115" fill="#666" fontSize="10" textAnchor="middle">0</text>
              <text x="100" y="18" fill="#666" fontSize="10" textAnchor="middle">MID</text>
              <text x="182" y="115" fill="#666" fontSize="10" textAnchor="middle">MAX</text>
            </svg>
          </div>

          {/* Selected car info */}
          {selectedCar ? (
            <div className="text-center">
              <div className="text-white font-black text-base">{selectedCar.name}</div>
              <div className="text-muted-foreground text-xs">{selectedCar.brand}</div>
              <div className="mt-1 text-accent font-bold text-sm">
                {formatNumber(selectedCar.milesPerSecond)} miles/s output
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Estimated reward: <span className="text-white font-bold">{formatNumber(calcReward(selectedCar.milesPerSecond))} miles</span>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm text-center">
              Select a vehicle to dyno
            </div>
          )}

          {/* Reward display */}
          {reward !== null && !running && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-3 text-center">
              <div className="text-emerald-400 font-black text-lg">+{formatNumber(reward)} miles!</div>
              <div className="text-emerald-600 text-xs uppercase tracking-wider">Dyno Complete</div>
            </div>
          )}

          {/* Button */}
          {cooldown > 0 ? (
            <div className="w-full text-center">
              <div className="text-muted-foreground text-sm font-bold">Cooldown: {cooldown}s</div>
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${(cooldown / 30) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <Button
              onClick={startDyno}
              disabled={!selectedCar || running}
              className="w-full font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {running ? `Pulling… ${Math.round(progress * 100)}%` : "🔥 Run Dyno"}
            </Button>
          )}

          {running && (
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${progress * 100}%`,
                  background: progress > 0.8 ? "#ff2222" : progress > 0.5 ? "#ffaa00" : "#00cc66",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-card border border-border/50 rounded-xl p-4 text-xs text-muted-foreground">
        <p className="font-bold text-white mb-1">How Dyno Mode works</p>
        <p>Your vehicle is strapped to the dynamometer and runs a full pull. Reward is based on the vehicle's passive output — more powerful vehicles earn more miles per run. Each run has a 30-second cooldown. Stack up your most powerful vehicles for maximum dyno scores.</p>
      </div>
    </div>
  );
}
