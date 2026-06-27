import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { CARS, type Car } from "@/lib/cars";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORY_COLORS: Record<string, string> = {
  jdm:              "#0055cc",
  super:            "#cc2200",
  hypercar:         "#cc8800",
  ev:               "#0099cc",
  retro:            "#8b6914",
  absolute:         "#cc0044",
  aircraft:         "#2277bb",
  extreme_aircraft: "#556b2f",
  missile:          "#cc4400",
  spacecraft:       "#0b3d91",
  space_objects:    "#4b0082",
  custom:           "#7700cc",
};

function CarCard({ car }: { car: Car }) {
  const { state, buyCar } = useGameState();
  const count = state.ownedCars.filter(id => id === car.id).length;
  const cost = Math.floor(car.baseCost * Math.pow(1.15, count));
  const canAfford = state.miles >= cost;
  const requiredPrestige = car.unlockRequirement
    ? parseInt(car.unlockRequirement.replace("Prestige ", ""))
    : 0;
  const isLocked = requiredPrestige > state.prestigeLevel;

  const rarityBorder: Record<string, string> = {
    common:   "border-border/50",
    rare:     "border-blue-500/30",
    legendary:"border-amber-500/40",
    prestige: "border-purple-500/50",
  };
  const rarityGlow: Record<string, string> = {
    common:   "",
    rare:     "hover:shadow-[0_0_16px_hsl(210_90%_60%/0.25)]",
    legendary:"hover:shadow-[0_0_20px_hsl(38_100%_55%/0.35)]",
    prestige: "hover:shadow-[0_0_28px_hsl(270_80%_70%/0.45)]",
  };

  const carColor = CATEGORY_COLORS[car.category] || "#555";

  return (
    <div className={`
      relative rounded-xl border bg-card p-3 flex flex-col gap-2 transition-all
      ${isLocked ? "opacity-55 border-border/30" : `${rarityBorder[car.rarity]} ${rarityGlow[car.rarity]}`}
    `}>
      {count > 0 && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-black px-1.5 py-0.5 rounded-full z-10">
          x{count}
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-background/60 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="text-xl mb-1">🔒</div>
            <div className="text-xs font-bold text-muted-foreground">{car.unlockRequirement}</div>
          </div>
        </div>
      )}

      {/* Vehicle visual */}
      <div className="w-full h-16 flex items-center justify-center bg-background/50 rounded-lg overflow-hidden">
        {car.imagePath ? (
          <img src={car.imagePath} alt={car.name} className="h-full object-contain" />
        ) : (
          <svg viewBox="0 0 120 60" className="w-24 drop-shadow-lg" fill="none">
            {car.category === "aircraft" || car.category === "extreme_aircraft" ? (
              <>
                <path d="M60 20 L100 35 L90 38 L60 30 L30 38 L20 35 Z" fill={carColor} />
                <path d="M60 20 L70 15 L80 20 L60 28 Z" fill={carColor} opacity="0.7" />
                <path d="M60 20 L50 40 L60 38 L70 40 Z" fill={carColor} opacity="0.8" />
              </>
            ) : car.category === "missile" ? (
              <>
                <path d="M90 28 L30 26 L25 30 L30 34 L90 32 Z" fill={carColor} />
                <path d="M90 28 L100 30 L90 32 Z" fill="#ff8800" />
                <path d="M25 26 L18 24 L22 30 L18 36 L25 34 Z" fill={carColor} opacity="0.7" />
              </>
            ) : car.category === "spacecraft" ? (
              <>
                <ellipse cx="60" cy="30" rx="15" ry="20" fill={carColor} />
                <path d="M45 30 L25 20 L30 30 L25 40 Z" fill={carColor} opacity="0.6" />
                <path d="M75 30 L95 20 L90 30 L95 40 Z" fill={carColor} opacity="0.6" />
                <ellipse cx="60" cy="22" rx="8" ry="6" fill="#88ccff" opacity="0.5" />
              </>
            ) : car.category === "space_objects" ? (
              <>
                <circle cx="60" cy="30" r="18" fill={carColor} opacity="0.7" />
                <circle cx="55" cy="26" r="5" fill="#ffffff" opacity="0.2" />
                <ellipse cx="60" cy="30" rx="28" ry="8" fill="none" stroke={carColor} strokeWidth="2" opacity="0.5" />
              </>
            ) : (
              <>
                <path d="M10 38 L15 22 Q30 14 60 12 Q90 14 105 22 L110 38 Z" fill={carColor} />
                <path d="M30 22 Q45 8 75 8 Q90 10 95 22 Z" fill={carColor} opacity="0.75" />
                <path d="M33 22 Q45 12 65 12 Q80 12 88 22 Z" fill="#88ccff" opacity="0.5" />
                <circle cx="30" cy="40" r="10" fill="#111" stroke="#444" strokeWidth="2" />
                <circle cx="30" cy="40" r="5"  fill="#222" stroke="#777" strokeWidth="1" />
                <circle cx="90" cy="40" r="10" fill="#111" stroke="#444" strokeWidth="2" />
                <circle cx="90" cy="40" r="5"  fill="#222" stroke="#777" strokeWidth="1" />
                <ellipse cx="108" cy="30" rx="4" ry="3" fill="#ffaa00" opacity="0.9" />
              </>
            )}
          </svg>
        )}
      </div>

      {/* Info */}
      <div>
        <div className="font-black text-white text-xs leading-tight">{car.name}</div>
        <div className="text-[10px] text-muted-foreground">{car.brand}</div>
        <Badge variant="outline" className={`mt-0.5 text-[9px] rarity-${car.rarity} border-current/30 px-1 py-0 h-4`}>
          {car.rarity}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <div className="bg-background/60 rounded p-1">
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">Passive</div>
          <div className="font-bold text-accent">{formatNumber(car.milesPerSecond)}/s</div>
        </div>
        <div className="bg-background/60 rounded p-1">
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">Click</div>
          <div className="font-bold text-primary">x{car.clickMultiplier.toExponential ? car.clickMultiplier > 1e6 ? car.clickMultiplier.toExponential(1) : car.clickMultiplier : car.clickMultiplier}</div>
        </div>
      </div>

      {/* Buy */}
      <Button
        onClick={() => buyCar(car.id)}
        disabled={!canAfford || isLocked}
        size="sm"
        className={`
          w-full font-bold uppercase tracking-wider text-[10px] h-7 px-2
          ${canAfford && !isLocked
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-secondary text-muted-foreground cursor-not-allowed"}
        `}
      >
        {isLocked ? car.unlockRequirement : `${formatNumber(cost)} mi`}
      </Button>
    </div>
  );
}

const CATEGORIES = [
  { id: "jdm",              label: "JDM" },
  { id: "retro",            label: "Retro" },
  { id: "ev",               label: "⚡ EV" },
  { id: "super",            label: "🏎️ Super" },
  { id: "hypercar",         label: "🔥 Hyper" },
  { id: "absolute",         label: "💀 Absolute" },
  { id: "aircraft",         label: "✈️ Aircraft" },
  { id: "extreme_aircraft", label: "🛡️ Extreme" },
  { id: "missile",          label: "🚀 Missiles" },
  { id: "spacecraft",       label: "🛸 Spacecraft" },
  { id: "space_objects",    label: "🌌 Space Objects" },
  { id: "custom",           label: "🔧 Custom" },
];

const CATEGORY_BANNERS: Record<string, { text: string; color: string }> = {
  jdm:      { text: "🏁 JDM — Japanese (and street) performance legends. From humble beginnings to the legendary R34.", color: "border-blue-500/30 bg-blue-500/5 text-blue-400" },
  retro:    { text: "🕰️ Retro — Classic icons from the golden age of automotive design, from the Model T to the Countach.", color: "border-yellow-600/30 bg-yellow-600/5 text-yellow-500" },
  ev:       { text: "⚡ EV — Pure electric speed. Zero emissions, maximum torque from Tesla's finest.", color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400" },
  super:    { text: "🏎️ Supercars — Ferrari, Lamborghini, McLaren, and more. The pinnacle of road-legal performance.", color: "border-red-500/30 bg-red-500/5 text-red-400" },
  hypercar: { text: "🔥 Hypercars — Ultra-rare machines from Bugatti, Koenigsegg, Pagani. Prestige required.", color: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
  absolute: { text: "💀 Absolute — Jet trucks, F1 cars, and machines that defy physics. Deep Prestige required.", color: "border-rose-500/30 bg-rose-500/5 text-rose-400" },
  aircraft: { text: "✈️ Aircraft — From Cessna 172 to the Airbus A380 and Concorde. Prestige-locked and astronomically powerful.", color: "border-sky-500/30 bg-sky-500/5 text-sky-400" },
  extreme_aircraft: { text: "🛡️ Extreme Aircraft — WW2 aces, Cold War interceptors, stealth fighters, and hypersonic experimentals.", color: "border-lime-700/40 bg-lime-900/10 text-lime-500" },
  missile:  { text: "🚀 Missiles — From FGM-148 Javelin to nuclear ICBMs. Deep Prestige required.", color: "border-orange-600/40 bg-orange-900/10 text-orange-400" },
  spacecraft: { text: "🛸 Spacecraft — Sputnik to Starship, Mercury to Artemis. Prestige 3–7 required.", color: "border-blue-800/40 bg-blue-950/20 text-blue-300" },
  space_objects: { text: "🌌 Space Objects — Exoplanets, stars, galaxies, and The Whole Universe. Prestige 7–9 required.", color: "border-purple-800/40 bg-purple-950/20 text-purple-300" },
  custom:   { text: "🔧 Custom Builds — Legendary one-off creations with absurd power. Prestige 8–9 required. Build your own in the Custom Garage!", color: "border-violet-500/30 bg-violet-500/5 text-violet-400" },
};

export default function Dealership() {
  const { state } = useGameState();
  const [activeTab, setActiveTab] = useState<string>("jdm");

  return (
    <div className="flex flex-col gap-4 animated-bg">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">
          Underground Dealership
        </h1>
        <p className="text-muted-foreground mt-1">
          Budget:{" "}
          <span className="text-accent font-bold neon-text-accent">
            {formatNumber(Math.floor(state.miles))} miles
          </span>
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border/50 p-1 flex flex-wrap gap-1 h-auto">
          {CATEGORIES.map(cat => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="font-bold uppercase tracking-wider text-[11px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(cat => {
          const banner = CATEGORY_BANNERS[cat.id];
          return (
            <TabsContent key={cat.id} value={cat.id} className="mt-3">
              {banner && (
                <div className={`mb-3 p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider ${banner.color}`}>
                  {banner.text}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
                {CARS.filter(c => c.category === cat.id).map(car => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
