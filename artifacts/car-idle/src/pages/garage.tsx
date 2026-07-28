import { useGameState } from "@/hooks/use-game-state";
import { CARS } from "@/lib/cars";
import { formatNumber } from "@/lib/utils";
import { playEngineRev } from "@/lib/audio";

const PAINT_COLORS = [
  { label: "Inferno", value: "#cc2200" },
  { label: "Midnight", value: "#0a0a1a" },
  { label: "Ice Blue", value: "#0066cc" },
  { label: "Phantom", value: "#1a001a" },
  { label: "Chrome", value: "#cccccc" },
  { label: "Viper Green", value: "#004400" },
  { label: "Gold Rush", value: "#cc8800" },
  { label: "Neon Pink", value: "#cc0066" },
];

const RIM_STYLES = ["Stock", "Forged", "Mesh", "Spokes", "Turbine"];
const DECAL_STYLES = ["None", "Racing Stripes", "Flames", "Tribal", "Carbon"];

export default function Garage() {
  const { state, selectCar, updateCustomization } = useGameState();
  const ownedUnique = [...new Set(state.ownedCars)];
  const activeCar = state.selectedCar ? CARS.find(c => c.id === state.selectedCar) : null;
  const custom = state.selectedCar ? (state.garageCustomizations[state.selectedCar] || { color: "#cc2200", decals: "None", rims: "Stock" }) : null;

  if (ownedUnique.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animated-bg">
        <div className="text-6xl">🏁</div>
        <h2 className="text-2xl font-black text-white">Garage is Empty</h2>
        <p className="text-muted-foreground">Buy your first car from the dealership to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animated-bg">
      {/* Car list */}
      <div className="w-full lg:w-72 flex flex-col gap-2">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Your Collection</div>
        {ownedUnique.map(carId => {
          const car = CARS.find(c => c.id === carId);
          if (!car) return null;
          const count = state.ownedCars.filter(id => id === carId).length;
          const isSelected = state.selectedCar === carId;
          return (
            <button
              key={carId}
              onClick={() => { selectCar(carId); playEngineRev(); }}
              className={`
                flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                ${isSelected
                  ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(0_90%_55%/0.2)]"
                  : "border-border/40 bg-card hover:border-primary/40 hover:bg-card/80"
                }
              `}
            >
              <div className="w-10 h-8 flex items-center justify-center bg-background/60 rounded shrink-0 overflow-hidden">
                {car.imagePath ? (
                  <img src={car.imagePath} alt={car.name} className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 12" className="w-8" fill="none">
                    <path d="M2 8 L4 3 Q8 1 12 1 Q16 1 20 3 L22 8 Z"
                      fill={state.garageCustomizations[carId]?.color || (car.category === 'ferrari' ? '#cc0000' : car.category === 'jdm' ? '#0055cc' : '#aa5500')} />
                    <circle cx="6" cy="9" r="2.5" fill="#222" stroke="#555" strokeWidth="0.5" />
                    <circle cx="18" cy="9" r="2.5" fill="#222" stroke="#555" strokeWidth="0.5" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{car.name}</div>
                <div className={`text-xs rarity-${car.rarity}`}>{car.rarity}</div>
              </div>
              {count > 1 && (
                <div className="text-xs font-black text-primary">x{count}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected car customizer */}
      <div className="flex-1">
        {activeCar && custom ? (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">{activeCar.name}</h1>
              <p className={`rarity-${activeCar.rarity} font-bold text-sm uppercase tracking-widest`}>{activeCar.brand} · {activeCar.rarity}</p>
            </div>

            {/* Big car preview */}
            <div className="bg-card/60 border border-border/40 rounded-2xl p-8 flex items-center justify-center" style={{ minHeight: 200 }}>
              <svg viewBox="0 0 240 120" className="w-64 lg:w-80 drop-shadow-2xl" fill="none">
                <path d="M20 76 L30 44 Q60 28 120 24 Q180 28 210 44 L220 76 Z" fill={custom.color} />
                <path d="M60 44 Q90 16 150 16 Q180 20 190 44 Z" fill={custom.color} opacity="0.8" />
                <path d="M66 44 Q90 24 130 24 Q160 24 176 44 Z" fill="#88ccff" opacity="0.5" />
                <circle cx="60" cy="80" r="20" fill="#111" stroke="#444" strokeWidth="3" />
                <circle cx="60" cy="80" r="10" fill="#222" stroke="#777" strokeWidth="2" />
                {custom.rims !== "Stock" && (
                  <g stroke="#aaa" strokeWidth="1.5">
                    <line x1="60" y1="70" x2="60" y2="90" />
                    <line x1="50" y1="80" x2="70" y2="80" />
                    <line x1="53" y1="73" x2="67" y2="87" />
                    <line x1="67" y1="73" x2="53" y2="87" />
                  </g>
                )}
                <circle cx="180" cy="80" r="20" fill="#111" stroke="#444" strokeWidth="3" />
                <circle cx="180" cy="80" r="10" fill="#222" stroke="#777" strokeWidth="2" />
                {custom.rims !== "Stock" && (
                  <g stroke="#aaa" strokeWidth="1.5">
                    <line x1="180" y1="70" x2="180" y2="90" />
                    <line x1="170" y1="80" x2="190" y2="80" />
                    <line x1="173" y1="73" x2="187" y2="87" />
                    <line x1="187" y1="73" x2="173" y2="87" />
                  </g>
                )}
                {custom.decals === "Racing Stripes" && (
                  <>
                    <line x1="100" y1="26" x2="96" y2="76" stroke="white" strokeWidth="4" opacity="0.6" />
                    <line x1="116" y1="26" x2="112" y2="76" stroke="white" strokeWidth="4" opacity="0.6" />
                  </>
                )}
                {custom.decals === "Flames" && (
                  <path d="M40 76 Q50 60 55 70 Q60 50 65 68 Q70 56 75 76 Z" fill="#ff4400" opacity="0.7" />
                )}
                <ellipse cx="216" cy="60" rx="8" ry="6" fill="#ffaa00" opacity="0.9" />
                <ellipse cx="24" cy="60" rx="8" ry="6" fill="#ff4400" opacity="0.7" />
              </svg>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border/40 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Passive</div>
                <div className="text-lg font-black text-accent">{formatNumber(activeCar.milesPerSecond)}/s</div>
              </div>
              <div className="bg-card border border-border/40 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Click Mult</div>
                <div className="text-lg font-black text-primary">x{activeCar.clickMultiplier}</div>
              </div>
              <div className="bg-card border border-border/40 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Owned</div>
                <div className="text-lg font-black text-white">x{state.ownedCars.filter(id => id === activeCar.id).length}</div>
              </div>
            </div>

            {/* Customization */}
            <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col gap-4">
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Customize</div>

              {/* Paint */}
              <div>
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Paint</div>
                <div className="flex flex-wrap gap-2">
                  {PAINT_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => updateCustomization(activeCar.id, { color: c.value })}
                      title={c.label}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${custom.color === c.value ? "border-white scale-110 shadow-lg" : "border-transparent hover:border-white/50"}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Rims */}
              <div>
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Rims</div>
                <div className="flex flex-wrap gap-2">
                  {RIM_STYLES.map(r => (
                    <button
                      key={r}
                      onClick={() => updateCustomization(activeCar.id, { rims: r })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${custom.rims === r ? "border-primary bg-primary/20 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/40"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decals */}
              <div>
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Decals</div>
                <div className="flex flex-wrap gap-2">
                  {DECAL_STYLES.map(d => (
                    <button
                      key={d}
                      onClick={() => updateCustomization(activeCar.id, { decals: d })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${custom.decals === d ? "border-accent bg-accent/20 text-accent" : "border-border/50 text-muted-foreground hover:border-accent/40"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Select a car from the list to customize it
          </div>
        )}
      </div>
    </div>
  );
}
