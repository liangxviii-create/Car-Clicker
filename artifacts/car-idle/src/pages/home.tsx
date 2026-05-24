import { useState, useRef, useCallback } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { CARS } from "@/lib/cars";
import { formatNumber } from "@/lib/utils";
import { playClickSound } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface ClickPop {
  id: number;
  x: number;
  y: number;
  value: number;
}

export default function Home() {
  const { state, milesPerSecond, clickValue, clickMainCar, buyCar } = useGameState();
  const [clicking, setClicking] = useState(false);
  const [pops, setPops] = useState<ClickPop[]>([]);
  const popIdRef = useRef(0);
  const carRef = useRef<HTMLDivElement>(null);

  const activeCar = state.selectedCar
    ? CARS.find(c => c.id === state.selectedCar)
    : null;

  const handleCarClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    playClickSound();
    clickMainCar();
    setClicking(true);
    setTimeout(() => setClicking(false), 300);

    const rect = carRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? rect.left + rect.width / 2 : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? rect.top + rect.height / 2 : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const id = ++popIdRef.current;
      setPops(prev => [...prev, { id, x, y, value: clickValue }]);
      setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 800);
    }
  }, [clickMainCar, clickValue]);

  const affordableCars = CARS.filter(c => {
    const count = state.ownedCars.filter(id => id === c.id).length;
    const cost = Math.floor(c.baseCost * Math.pow(1.15, count));
    return state.miles >= cost * 0.5;
  }).slice(0, 5);

  const prestigeRequired = 1000000 * Math.pow(10, state.prestigeLevel);
  const prestigeProgress = Math.min((state.totalMilesEver / prestigeRequired) * 100, 100);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animated-bg min-h-[calc(100vh-8rem)]">
      {/* Left: Main Clicker */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">
        {/* Speed lines bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-l from-transparent via-primary/20 to-transparent w-full"
              style={{ top: `${10 + i * 12}%`, animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>

        {/* Miles display */}
        <div className="text-center z-10">
          <div className="text-5xl lg:text-7xl font-black text-white tracking-tighter">
            {formatNumber(Math.floor(state.miles))}
          </div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">miles</div>
          <div className="text-lg font-bold text-accent neon-text-accent mt-1">
            +{formatNumber(milesPerSecond)} / sec
          </div>
        </div>

        {/* Car clickable */}
        <div
          ref={carRef}
          className="relative cursor-pointer select-none z-10"
          onClick={handleCarClick}
          onTouchStart={handleCarClick}
        >
          <div className={`transition-all duration-150 ${clicking ? "scale-95" : "scale-100"}`}>
            <div
              className={`w-48 h-32 lg:w-64 lg:h-44 flex items-center justify-center rounded-xl border-2 ${clicking ? "border-primary shadow-[0_0_40px_hsl(0_90%_55%/0.8)]" : "border-primary/30 shadow-[0_0_20px_hsl(0_90%_55%/0.3)]"} bg-card/60 backdrop-blur-sm transition-all duration-150 relative overflow-hidden`}
            >
              {/* Car SVG */}
              <svg viewBox="0 0 120 60" className="w-36 lg:w-48 drop-shadow-2xl" fill="none">
                {/* Body */}
                <path d="M10 38 L15 22 Q30 14 60 12 Q90 14 105 22 L110 38 Z" fill={state.garageCustomizations[state.selectedCar || '']?.color || "#cc2200"} />
                {/* Roof */}
                <path d="M30 22 Q45 8 75 8 Q90 10 95 22 Z" fill={state.garageCustomizations[state.selectedCar || '']?.color || "#cc2200"} opacity="0.8" />
                {/* Windows */}
                <path d="M33 22 Q45 12 65 12 Q80 12 88 22 Z" fill="#88ccff" opacity="0.6" />
                {/* Wheels */}
                <circle cx="30" cy="40" r="10" fill="#111" stroke="#555" strokeWidth="2" />
                <circle cx="30" cy="40" r="5" fill="#333" stroke="#888" strokeWidth="1" />
                <circle cx="90" cy="40" r="10" fill="#111" stroke="#555" strokeWidth="2" />
                <circle cx="90" cy="40" r="5" fill="#333" stroke="#888" strokeWidth="1" />
                {/* Headlights */}
                <ellipse cx="108" cy="30" rx="4" ry="3" fill="#ffaa00" opacity="0.9" />
                <ellipse cx="12" cy="30" rx="4" ry="3" fill="#ff4400" opacity="0.7" />
                {/* Ground line */}
                <line x1="5" y1="50" x2="115" y2="50" stroke="#333" strokeWidth="1" />
              </svg>
              {/* Click ripple */}
              {clicking && (
                <div className="absolute inset-0 rounded-xl border border-primary animate-ping opacity-50" />
              )}
            </div>
          </div>

          {/* Click pops */}
          {pops.map(pop => (
            <div
              key={pop.id}
              className="click-pop"
              style={{ left: pop.x - 20, top: pop.y - 20 }}
            >
              +{formatNumber(pop.value)}
            </div>
          ))}
        </div>

        {activeCar && (
          <div className="text-center z-10">
            <div className="text-lg font-black text-white">{activeCar.name}</div>
            <div className="text-sm text-muted-foreground">{activeCar.brand} · <span className={`rarity-${activeCar.rarity}`}>{activeCar.rarity}</span></div>
          </div>
        )}

        {/* Stats row */}
        <div className="flex gap-4 z-10">
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Cars</div>
            <div className="text-xl font-black text-white">{new Set(state.ownedCars).size}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Prestige</div>
            <div className="text-xl font-black text-primary neon-text-primary">{state.prestigeLevel}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Click</div>
            <div className="text-xl font-black text-accent neon-text-accent">+{formatNumber(clickValue)}</div>
          </div>
        </div>

        {/* Prestige progress */}
        <div className="w-full max-w-xs z-10">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="uppercase tracking-wider">Prestige Progress</span>
            <span>{formatNumber(state.totalMilesEver)} / {formatNumber(prestigeRequired)}</span>
          </div>
          <Progress value={prestigeProgress} className="h-2 bg-secondary" />
        </div>

        <div className="flex gap-3 z-10">
          <Link href="/dealership">
            <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10 font-bold uppercase tracking-wider">
              Buy Cars
            </Button>
          </Link>
          <Link href="/drift">
            <Button variant="outline" size="sm" className="border-accent/40 text-accent hover:bg-accent/10 font-bold uppercase tracking-wider">
              Drift
            </Button>
          </Link>
          <Link href="/race">
            <Button variant="outline" size="sm" className="border-accent/40 text-accent hover:bg-accent/10 font-bold uppercase tracking-wider">
              Race
            </Button>
          </Link>
        </div>
      </div>

      {/* Right: Quick Buy Sidebar */}
      <div className="w-full lg:w-72 flex flex-col gap-3">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Buy</div>
        {CARS.slice(0, 8).map(car => {
          const count = state.ownedCars.filter(id => id === car.id).length;
          const cost = Math.floor(car.baseCost * Math.pow(1.15, count));
          const canAfford = state.miles >= cost;
          const isLocked = car.unlockRequirement && state.prestigeLevel < parseInt(car.unlockRequirement.replace("Prestige ", ""));

          return (
            <button
              key={car.id}
              onClick={() => !isLocked && buyCar(car.id)}
              disabled={!canAfford || !!isLocked}
              className={`
                flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                ${canAfford && !isLocked
                  ? "border-primary/30 bg-card hover:bg-primary/10 hover:border-primary cursor-pointer"
                  : "border-border/30 bg-card/30 opacity-50 cursor-not-allowed"
                }
              `}
            >
              <div className="w-8 h-8 rounded flex items-center justify-center bg-background/80 shrink-0">
                <svg viewBox="0 0 24 12" className="w-6" fill="none">
                  <path d="M2 8 L4 3 Q8 1 12 1 Q16 1 20 3 L22 8 Z" fill={canAfford ? "hsl(0 90% 55%)" : "#444"} />
                  <circle cx="6" cy="9" r="2.5" fill="#222" stroke="#666" strokeWidth="0.5" />
                  <circle cx="18" cy="9" r="2.5" fill="#222" stroke="#666" strokeWidth="0.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground truncate">{car.name}</div>
                <div className={`text-xs rarity-${car.rarity}`}>{car.rarity} {count > 0 && `(x${count})`}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-sm font-black ${canAfford && !isLocked ? "text-accent neon-text-accent" : "text-muted-foreground"}`}>
                  {isLocked ? car.unlockRequirement : formatNumber(cost)}
                </div>
                <div className="text-xs text-muted-foreground">+{formatNumber(car.milesPerSecond)}/s</div>
              </div>
            </button>
          );
        })}
        <Link href="/dealership" className="text-center text-xs text-primary hover:underline py-2">
          View all cars &rarr;
        </Link>
      </div>
    </div>
  );
}
