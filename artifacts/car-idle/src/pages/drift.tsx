import { useState, useEffect, useRef, useCallback } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { formatNumber } from "@/lib/utils";
import { playTireScreech, playEngineRev } from "@/lib/audio";
import { Button } from "@/components/ui/button";

type Lane = "left" | "center" | "right";
type GameStatus = "idle" | "playing" | "finished";

const LANE_X: Record<Lane, number> = { left: 30, center: 50, right: 70 };
const CORNER_DURATIONS = 2000;

interface Corner {
  id: number;
  lane: Lane;
  y: number;
}

export default function Drift() {
  const { addBonusMiles } = useGameState();
  const [status, setStatus] = useState<GameStatus>("idle");
  const [lane, setLane] = useState<Lane>("center");
  const [score, setScore] = useState(0);
  const [corners, setCorners] = useState<Corner[]>([]);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hitEffect, setHitEffect] = useState<"success" | "miss" | null>(null);
  const gameRef = useRef<NodeJS.Timeout | null>(null);
  const cornerIdRef = useRef(0);

  const startGame = () => {
    setStatus("playing");
    setScore(0);
    setCombo(0);
    setTimeLeft(30);
    setLane("center");
    setCorners([]);
    playEngineRev();
  };

  const endGame = useCallback(() => {
    if (gameRef.current) clearInterval(gameRef.current);
    setStatus("finished");
    addBonusMiles(score);
  }, [score, addBonusMiles]);

  // Spawn corners
  useEffect(() => {
    if (status !== "playing") return;
    const interval = setInterval(() => {
      const lanes: Lane[] = ["left", "center", "right"];
      const randomLane = lanes[Math.floor(Math.random() * 3)];
      cornerIdRef.current++;
      setCorners(prev => [...prev, { id: cornerIdRef.current, lane: randomLane, y: 10 }]);
    }, 1200);
    return () => clearInterval(interval);
  }, [status]);

  // Move corners down
  useEffect(() => {
    if (status !== "playing") return;
    const interval = setInterval(() => {
      setCorners(prev =>
        prev
          .map(c => ({ ...c, y: c.y + 4 }))
          .filter(c => {
            if (c.y > 90) {
              // Missed corner
              setCombo(0);
              setHitEffect("miss");
              setTimeout(() => setHitEffect(null), 400);
              return false;
            }
            return true;
          })
      );
    }, 100);
    return () => clearInterval(interval);
  }, [status]);

  // Countdown
  useEffect(() => {
    if (status !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, endGame]);

  const handleLaneChange = (newLane: Lane) => {
    if (status !== "playing") return;
    setLane(newLane);
    playTireScreech();

    // Check if any corner is in the hit zone (y between 70-85)
    const hitCorner = corners.find(c => c.lane === newLane && c.y >= 65 && c.y <= 90);
    if (hitCorner) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = Math.floor(100 * (1 + newCombo * 0.1));
      setScore(prev => prev + points);
      setCorners(prev => prev.filter(c => c.id !== hitCorner.id));
      setHitEffect("success");
      setTimeout(() => setHitEffect(null), 300);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") handleLaneChange("left");
      if (e.key === "ArrowRight" || e.key === "d") handleLaneChange("right");
      if (e.key === "ArrowDown" || e.key === "s") handleLaneChange("center");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [status, lane, combo, corners]);

  return (
    <div className="flex flex-col items-center gap-6 animated-bg">
      <div className="text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">Drift Mode</h1>
        <p className="text-muted-foreground mt-1">Hit corners at the right lane. Earn bonus miles!</p>
      </div>

      {status === "idle" && (
        <div className="text-center flex flex-col items-center gap-4">
          <div className="text-muted-foreground max-w-sm text-sm">
            Tap the lane buttons (or use arrow keys) to switch lanes and hit corners as they arrive.
            Build combos for bigger bonuses.
          </div>
          <Button onClick={startGame} size="lg" className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8 neon-border-primary">
            Start Drifting
          </Button>
        </div>
      )}

      {status === "finished" && (
        <div className="text-center flex flex-col items-center gap-4">
          <div className="text-5xl font-black text-accent neon-text-accent">{formatNumber(score)}</div>
          <div className="text-muted-foreground uppercase tracking-widest text-sm">Bonus Miles Earned</div>
          <Button onClick={startGame} size="lg" className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8">
            Race Again
          </Button>
        </div>
      )}

      {status === "playing" && (
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          {/* HUD */}
          <div className="flex w-full justify-between text-sm font-bold">
            <span className="text-primary neon-text-primary">Score: {formatNumber(score)}</span>
            <span className="text-accent neon-text-accent">Combo x{combo}</span>
            <span className="text-white">{timeLeft}s</span>
          </div>

          {/* Game area */}
          <div
            className={`relative w-full bg-card border-2 rounded-xl overflow-hidden transition-colors ${hitEffect === "success" ? "border-green-400" : hitEffect === "miss" ? "border-red-500" : "border-border/40"}`}
            style={{ height: 400 }}
          >
            {/* Road lanes */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 border-r border-border/20" />
              <div className="flex-1 border-r border-border/20" />
              <div className="flex-1" />
            </div>

            {/* Lane labels */}
            <div className="absolute bottom-16 left-0 right-0 flex justify-around px-4 pointer-events-none">
              {(["left", "center", "right"] as Lane[]).map(l => (
                <div key={l} className={`text-xs font-bold uppercase tracking-widest ${lane === l ? "text-primary neon-text-primary" : "text-muted-foreground"}`}>
                  {l}
                </div>
              ))}
            </div>

            {/* Hit zone */}
            <div className="absolute left-0 right-0 h-px bg-primary/30" style={{ bottom: "18%" }} />
            <div className="absolute left-0 right-0 h-8 bg-primary/5 border-y border-primary/10" style={{ bottom: "16%" }} />

            {/* Corners */}
            {corners.map(corner => (
              <div
                key={corner.id}
                className="absolute w-12 h-8 rounded-lg border-2 border-accent bg-accent/20 flex items-center justify-center transition-none"
                style={{
                  left: `${LANE_X[corner.lane]}%`,
                  top: `${corner.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="w-4 h-1 bg-accent rounded" />
              </div>
            ))}

            {/* Player car */}
            <div
              className="absolute bottom-4 transition-all duration-100"
              style={{ left: `${LANE_X[lane]}%`, transform: "translateX(-50%)" }}
            >
              <svg viewBox="0 0 40 20" className="w-10 drop-shadow-lg" fill="none">
                <path d="M4 14 L6 7 Q12 4 20 4 Q28 4 34 7 L36 14 Z" fill="hsl(0 90% 55%)" />
                <path d="M10 7 Q16 2 24 2 Q30 3 32 7 Z" fill="hsl(0 90% 40%)" />
                <circle cx="10" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
                <circle cx="30" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
              </svg>
            </div>
          </div>

          {/* Lane buttons */}
          <div className="flex gap-4 w-full">
            {(["left", "center", "right"] as Lane[]).map(l => (
              <button
                key={l}
                onPointerDown={() => handleLaneChange(l)}
                className={`
                  flex-1 py-5 rounded-xl font-black uppercase tracking-wider text-sm border-2 transition-all active:scale-95
                  ${lane === l
                    ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_hsl(0_90%_55%/0.4)]"
                    : "border-border/40 bg-card text-muted-foreground hover:border-primary/40"
                  }
                `}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">Also: Arrow Keys or A/S/D</div>
        </div>
      )}
    </div>
  );
}
