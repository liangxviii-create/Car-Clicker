import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { CARS, type Car } from "@/lib/cars";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CarCard({ car }: { car: Car }) {
  const { state, buyCar } = useGameState();
  const count = state.ownedCars.filter(id => id === car.id).length;
  const cost = Math.floor(car.baseCost * Math.pow(1.15, count));
  const canAfford = state.miles >= cost;
  const requiredPrestige = car.unlockRequirement ? parseInt(car.unlockRequirement.replace("Prestige ", "")) : 0;
  const isLocked = requiredPrestige > state.prestigeLevel;

  const rarityGlow: Record<string, string> = {
    common: "",
    rare: "hover:shadow-[0_0_20px_hsl(210_90%_60%/0.3)]",
    legendary: "hover:shadow-[0_0_20px_hsl(38_100%_55%/0.4)]",
    prestige: "hover:shadow-[0_0_30px_hsl(270_80%_70%/0.5)]",
  };

  const rarityBorder: Record<string, string> = {
    common: "border-border/50",
    rare: "border-blue-500/30",
    legendary: "border-amber-500/40",
    prestige: "border-purple-500/50",
  };

  return (
    <div className={`
      relative rounded-xl border bg-card p-4 flex flex-col gap-3 transition-all
      ${isLocked ? "opacity-60 border-border/30" : `${rarityBorder[car.rarity]} ${rarityGlow[car.rarity]}`}
    `}>
      {count > 0 && (
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-black px-2 py-0.5 rounded-full">
          x{count}
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-background/60 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="text-2xl mb-1">🔒</div>
            <div className="text-sm font-bold text-muted-foreground">{car.unlockRequirement}</div>
          </div>
        </div>
      )}

      {/* Car visual */}
      <div className="w-full h-24 flex items-center justify-center bg-background/50 rounded-lg overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-32 drop-shadow-lg" fill="none">
          <path d="M10 38 L15 22 Q30 14 60 12 Q90 14 105 22 L110 38 Z"
            fill={car.category === 'ferrari' ? '#cc0000' : car.category === 'jdm' ? '#0055cc' : car.category === 'exotic' ? '#6600cc' : '#aa5500'} />
          <path d="M30 22 Q45 8 75 8 Q90 10 95 22 Z"
            fill={car.category === 'ferrari' ? '#aa0000' : car.category === 'jdm' ? '#0044aa' : car.category === 'exotic' ? '#5500aa' : '#884400'} />
          <path d="M33 22 Q45 12 65 12 Q80 12 88 22 Z" fill="#88ccff" opacity="0.5" />
          <circle cx="30" cy="40" r="10" fill="#111" stroke="#444" strokeWidth="2" />
          <circle cx="30" cy="40" r="5" fill="#222" stroke="#777" strokeWidth="1" />
          <circle cx="90" cy="40" r="10" fill="#111" stroke="#444" strokeWidth="2" />
          <circle cx="90" cy="40" r="5" fill="#222" stroke="#777" strokeWidth="1" />
          <ellipse cx="108" cy="30" rx="4" ry="3" fill="#ffaa00" opacity="0.9" />
        </svg>
      </div>

      <div>
        <div className="font-black text-white text-base">{car.name}</div>
        <div className="text-xs text-muted-foreground">{car.brand}</div>
        <Badge variant="outline" className={`mt-1 text-xs rarity-${car.rarity} border-current/30`}>
          {car.rarity}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-background/60 rounded p-2">
          <div className="text-muted-foreground uppercase tracking-wider text-[10px]">Passive</div>
          <div className="font-bold text-accent">{formatNumber(car.milesPerSecond)}/s</div>
        </div>
        <div className="bg-background/60 rounded p-2">
          <div className="text-muted-foreground uppercase tracking-wider text-[10px]">Click</div>
          <div className="font-bold text-primary">x{car.clickMultiplier}</div>
        </div>
      </div>

      <Button
        onClick={() => buyCar(car.id)}
        disabled={!canAfford || isLocked}
        size="sm"
        className={`
          w-full font-bold uppercase tracking-wider text-xs
          ${canAfford && !isLocked
            ? "bg-primary hover:bg-primary/90 text-primary-foreground neon-border-primary"
            : "bg-secondary text-muted-foreground cursor-not-allowed"}
        `}
      >
        {isLocked ? car.unlockRequirement : `Buy — ${formatNumber(cost)} mi`}
      </Button>
    </div>
  );
}

export default function Dealership() {
  const { state } = useGameState();
  const [activeTab, setActiveTab] = useState<string>("jdm");

  const categories = [
    { id: "jdm", label: "JDM" },
    { id: "muscle", label: "Muscle" },
    { id: "ferrari", label: "Ferrari" },
    { id: "exotic", label: "Exotic" },
  ];

  return (
    <div className="flex flex-col gap-6 animated-bg">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">
          Underground Dealership
        </h1>
        <p className="text-muted-foreground mt-1">
          Budget: <span className="text-accent font-bold neon-text-accent">{formatNumber(Math.floor(state.miles))} miles</span>
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border/50 p-1">
          {categories.map(cat => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="font-bold uppercase tracking-wider text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CARS.filter(c => c.category === cat.id).map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
