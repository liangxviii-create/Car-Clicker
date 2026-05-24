import { useState, useEffect, useRef, useCallback } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { formatNumber } from "@/lib/utils";
import { playEngineRev, playPurchaseSound } from "@/lib/audio";
import { Button } from "@/components/ui/button";

type RaceStatus = "idle" | "countdown" | "racing" | "finished";

const GEARS = 6;
const GEAR_WINDOWS = [
  { start: 5, end: 25 },
  { start: 30, end: 52 },
  { start: 57, end: 74 },
  { start: 78, end: 89 },
  { start: 92, end: 97 },
  { start: 98, end: 100 },
];

export default function Race() {
  const { state, addBonusMiles } = useGameState();
  const [raceStatus, setRaceStatus] = useState<RaceStatus>("idle");
  const [countdown, setCountdown] = useState(3);
  const [gear, setGear] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [rpmTarget, setRpmTarget] = useState(50);
  const [playerX, setPlayerX] = useState(5);
  const [opponentX, setOpponentX] = useState(5);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [reward, setReward] = useState(0);
  const [shiftFeedback, setShiftFeedback] = useState<"perfect" | "good" | "miss" | null>(null);
  const rpmRef = useRef(rpm);
  rpmRef.current = rpm;
  const gearRef = useRef(gear);
  gearRef.current = gear;

  const startRace = () => {
    setRaceStatus("countdown");
    setCountdown(3);
    setGear(0);
    setRpm(0);
    setRpmTarget(50);
    setPlayerX(5);
    setOpponentX(5);
    setResult(null);
    setShiftFeedback(null);
  };

  // Countdown
  useEffect(() => {
    if (raceStatus !== "countdown") return;
    if (countdown <= 0) {
      setRaceStatus("racing");
      playEngineRev();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [raceStatus, countdown]);

  // RPM oscillation
  useEffect(() => {
    if (raceStatus !== "racing") return;
    const interval = setInterval(() => {
      setRpm(prev => {
        // Oscillate toward and past the target
        const g = gearRef.current;
        const win = GEAR_WINDOWS[g] || GEAR_WINDOWS[GEARS - 1];
        const targetMid = (win.start + win.end) / 2;
        const speed = 1.5;
        const next = prev + (prev < targetMid ? speed : -speed * 0.8);
        return Math.max(0, Math.min(100, next));
      });
    }, 50);
    return () => clearInterval(interval);
  }, [raceStatus]);

  // Opponent progress
  useEffect(() => {
    if (raceStatus !== "racing") return;
    const interval = setInterval(() => {
      setOpponentX(prev => {
        const newX = prev + (0.3 + Math.random() * 0.2);
        if (newX >= 95) {
          // Opponent finished
          setRaceStatus("finished");
          setResult("lose");
          const rewardAmt = Math.floor(state.miles * 0.05);
          setReward(rewardAmt);
          return prev;
        }
        return newX;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [raceStatus, state.miles]);

  const handleShift = useCallback(() => {
    if (raceStatus !== "racing") return;
    const g = gearRef.current;
    const win = GEAR_WINDOWS[g];
    if (!win) return;

    const currentRpm = rpmRef.current;
    let quality: "perfect" | "good" | "miss" = "miss";
    let advance = 0;

    if (currentRpm >= win.start + 5 && currentRpm <= win.end - 5) {
      quality = "perfect";
      advance = 3 + (g * 0.5);
    } else if (currentRpm >= win.start && currentRpm <= win.end) {
      quality = "good";
      advance = 1.5 + (g * 0.3);
    } else {
      quality = "miss";
      advance = 0.3;
    }

    setShiftFeedback(quality);
    setTimeout(() => setShiftFeedback(null), 500);

    if (quality !== "miss") playEngineRev();

    const nextGear = Math.min(g + 1, GEARS - 1);
    setGear(nextGear);
    setRpm(20);
    setPlayerX(prev => {
      const newX = prev + advance;
      if (newX >= 95 && nextGear >= GEARS - 1) {
        setRaceStatus("finished");
        setResult("win");
        const rewardAmt = Math.floor((state.miles * 0.15) * (quality === "perfect" ? 2 : 1.2));
        setReward(rewardAmt);
        playPurchaseSound();
        addBonusMiles(rewardAmt);
      }
      return Math.min(newX, 95);
    });
  }, [raceStatus, state.miles, addBonusMiles]);

  // Space bar / tap to shift
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); handleShift(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleShift]);

  const win = GEAR_WINDOWS[gear] || GEAR_WINDOWS[GEARS - 1];

  return (
    <div className="flex flex-col items-center gap-6 animated-bg">
      <div className="text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">Street Race</h1>
        <p className="text-muted-foreground mt-1">Hit SHIFT at the right RPM zone. Win to earn bonus miles!</p>
      </div>

      {raceStatus === "idle" && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-muted-foreground text-sm max-w-sm text-center">
            Tap SHIFT (or Space) when the RPM needle is in the green zone. Perfect shifts build speed faster.
          </div>
          <Button onClick={startRace} size="lg" className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8 neon-border-primary">
            Line Up
          </Button>
        </div>
      )}

      {raceStatus === "countdown" && (
        <div className="text-8xl font-black text-primary neon-text-primary animate-pulse">
          {countdown > 0 ? countdown : "GO!"}
        </div>
      )}

      {(raceStatus === "racing" || raceStatus === "finished") && (
        <div className="w-full max-w-lg flex flex-col gap-4">
          {/* Race track */}
          <div className="relative bg-card border border-border/40 rounded-xl overflow-hidden h-28">
            {/* Road */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-800" />
            {/* Center line */}
            <div className="absolute top-1/2 left-0 right-0 h-px border-t-2 border-dashed border-white/10" />

            {/* Finish line */}
            <div className="absolute top-0 bottom-0 w-3 bg-white/10" style={{ right: "5%" }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`w-full h-1/6 ${i % 2 === 0 ? "bg-white/30" : "bg-black/30"}`} />
              ))}
            </div>

            {/* Player car */}
            <div
              className="absolute top-4 transition-all duration-100"
              style={{ left: `${playerX}%` }}
            >
              <svg viewBox="0 0 40 20" className="w-12 drop-shadow-lg" fill="none">
                <path d="M4 14 L6 7 Q12 4 20 4 Q28 4 34 7 L36 14 Z" fill="hsl(0 90% 55%)" />
                <path d="M10 7 Q16 2 24 2 Q30 3 32 7 Z" fill="hsl(0 90% 40%)" />
                <circle cx="10" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
                <circle cx="30" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
              </svg>
              <div className="text-[10px] text-center text-primary font-bold mt-0.5">YOU</div>
            </div>

            {/* Opponent car */}
            <div
              className="absolute bottom-4 transition-all duration-100"
              style={{ left: `${opponentX}%` }}
            >
              <svg viewBox="0 0 40 20" className="w-12 drop-shadow-lg" fill="none">
                <path d="M4 14 L6 7 Q12 4 20 4 Q28 4 34 7 L36 14 Z" fill="hsl(190 90% 50%)" />
                <path d="M10 7 Q16 2 24 2 Q30 3 32 7 Z" fill="hsl(190 90% 35%)" />
                <circle cx="10" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
                <circle cx="30" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
              </svg>
              <div className="text-[10px] text-center text-cyan-400 font-bold mt-0.5">CPU</div>
            </div>
          </div>

          {/* RPM gauge */}
          <div className="bg-card border border-border/40 rounded-xl p-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span className="uppercase tracking-wider">RPM Gauge</span>
              <span className="font-bold text-white">Gear {gear + 1}/{GEARS}</span>
            </div>
            <div className="relative h-8 bg-background rounded-lg overflow-hidden">
              {/* Zones */}
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-red-900/30" />
                <div className="bg-yellow-600/30" style={{ width: `${win.end - win.start}%`, marginLeft: `${win.start}%` }} />
              </div>
              {/* Perfect window */}
              <div
                className="absolute top-0 bottom-0 bg-green-500/40 border-x border-green-400/60"
                style={{ left: `${win.start + 5}%`, width: `${win.end - win.start - 10}%` }}
              />
              {/* Needle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white] transition-none rounded"
                style={{ left: `${rpm}%`, transform: "translateX(-50%)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/50 uppercase tracking-widest">
                {rpm < win.start ? "Too low" : rpm > win.end ? "Too high" : "SHIFT!"}
              </div>
            </div>

            {shiftFeedback && (
              <div className={`text-center text-sm font-black mt-2 uppercase tracking-widest ${shiftFeedback === "perfect" ? "text-green-400" : shiftFeedback === "good" ? "text-yellow-400" : "text-red-400"}`}>
                {shiftFeedback === "perfect" ? "PERFECT SHIFT!" : shiftFeedback === "good" ? "GOOD!" : "MISS!"}
              </div>
            )}
          </div>

          {/* Shift button */}
          {raceStatus === "racing" && (
            <button
              onPointerDown={handleShift}
              className="w-full py-6 rounded-xl bg-primary border-2 border-primary text-primary-foreground font-black text-2xl uppercase tracking-widest active:scale-95 transition-all neon-border-primary select-none"
            >
              SHIFT
            </button>
          )}

          {/* Result */}
          {raceStatus === "finished" && result && (
            <div className={`text-center p-6 rounded-xl border-2 ${result === "win" ? "border-green-400 bg-green-400/10" : "border-red-500 bg-red-500/10"}`}>
              <div className={`text-4xl font-black uppercase tracking-tight mb-2 ${result === "win" ? "text-green-400" : "text-red-400"}`}>
                {result === "win" ? "WINNER!" : "DEFEATED"}
              </div>
              {result === "win" && (
                <div className="text-accent text-lg font-bold">+{formatNumber(reward)} Miles Earned!</div>
              )}
              <Button onClick={startRace} className="mt-4 font-bold uppercase tracking-widest bg-primary text-primary-foreground">
                Race Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
