import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { CARS, type Car } from "@/lib/cars";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORY_COLORS: Record<string, string> = {
  jdm:      "#0055cc",
  muscle:   "#aa5500",
  ferrari:  "#cc0000",
  exotic:   "#7700cc",
  hypercar: "#cc8800",
  luxury:   "#1a7a4a",
  ev:       "#0099cc",
  retro:    "#8b6914",
  absolute: "#cc0044",
  aircraft:         "#2277bb",
  extreme_aircraft: "#556b2f",
  missile:     "#cc4400",
  spacecraft:  "#0b3d91",
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

      {/* Car visual */}
      <div className="w-full h-16 flex items-center justify-center bg-background/50 rounded-lg overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-24 drop-shadow-lg" fill="none">
          <path d="M10 38 L15 22 Q30 14 60 12 Q90 14 105 22 L110 38 Z" fill={carColor} />
          <path d="M30 22 Q45 8 75 8 Q90 10 95 22 Z" fill={carColor} opacity="0.75" />
          <path d="M33 22 Q45 12 65 12 Q80 12 88 22 Z" fill="#88ccff" opacity="0.5" />
          <circle cx="30" cy="40" r="10" fill="#111" stroke="#444" strokeWidth="2" />
          <circle cx="30" cy="40" r="5"  fill="#222" stroke="#777" strokeWidth="1" />
          <circle cx="90" cy="40" r="10" fill="#111" stroke="#444" strokeWidth="2" />
          <circle cx="90" cy="40" r="5"  fill="#222" stroke="#777" strokeWidth="1" />
          <ellipse cx="108" cy="30" rx="4" ry="3" fill="#ffaa00" opacity="0.9" />
        </svg>
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
          <div className="font-bold text-primary">x{car.clickMultiplier}</div>
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
  { id: "jdm",      label: "JDM" },
  { id: "muscle",   label: "Muscle" },
  { id: "ferrari",  label: "Ferrari" },
  { id: "exotic",   label: "Exotic" },
  { id: "luxury",   label: "Luxury" },
  { id: "ev",       label: "⚡ EV" },
  { id: "retro",    label: "Retro" },
  { id: "hypercar", label: "🔥 Hyper" },
  { id: "absolute", label: "💀 Absolute" },
  { id: "aircraft",         label: "✈️ Aircraft" },
  { id: "extreme_aircraft", label: "🛡️ Extreme" },
  { id: "missile",     label: "🚀 Missiles" },
  { id: "spacecraft",  label: "🛸 Spacecraft" },
];

const CATEGORY_BANNERS: Record<string, { text: string; color: string }> = {
  hypercar: { text: "🔥 Hypercars require Prestige to unlock — the fastest machines ever built.", color: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
  luxury:   { text: "🏆 Luxury SUVs and ultra-premium grand tourers. Opulence earns miles too.", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" },
  ev:       { text: "⚡ Pure electric speed — zero emissions, maximum torque.", color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400" },
  retro:    { text: "🕰️ Classic icons from the golden age of automotive design.", color: "border-yellow-600/30 bg-yellow-600/5 text-yellow-500" },
  absolute: { text: "💀 The Absolute tier — race cars, jet-powered trucks, and machines that defy physics. Requires deep Prestige.", color: "border-red-500/30 bg-red-500/5 text-red-400" },
  aircraft:         { text: "✈️ Aircraft — commercial jetliners, WWII fighters, and strategic bombers. Prestige-locked and astronomically powerful.", color: "border-sky-500/30 bg-sky-500/5 text-sky-400" },
  extreme_aircraft: { text: "🛡️ Extreme Aircraft — Cold War interceptors, stealth fighters, and hypersonic experimentals. The most destructive machines ever built.", color: "border-lime-700/40 bg-lime-900/10 text-lime-500" },
  missile:    { text: "🚀 Missiles — from shoulder-fired anti-tank rounds to nuclear ICBMs. The K-4 tops out at 8 Trillion miles and 40B/s. You'll need deep Prestige.", color: "border-orange-600/40 bg-orange-900/10 text-orange-400" },
  spacecraft: { text: "🛸 Spacecraft — historic missions from Vostok 1 to Artemis II. Artemis II tops the entire game at 100 Quadrillion miles and 500B/s. Prestige 3–7 required.", color: "border-blue-800/40 bg-blue-950/20 text-blue-300" },
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
