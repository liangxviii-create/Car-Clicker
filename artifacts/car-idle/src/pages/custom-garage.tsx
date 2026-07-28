import { useState, useRef, useEffect, useCallback } from "react";
import { useGameState, type CustomVehicle } from "@/hooks/use-game-state";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RARITY_OPTIONS = ["common", "rare", "legendary", "prestige"] as const;
const MAX_HP = 1_000_000_000_000; // 1 trillion HP cap

const EMPTY_FORM: Omit<CustomVehicle, "id" | "createdAt"> = {
  name: "",
  brand: "",
  horsepower: 500,
  topSpeed: 200,
  engine: "",
  description: "",
  rarity: "common",
  unlockCost: 0,
  imagePath: undefined,
};

interface CommunityVehicle {
  id: number;
  playerId: string;
  playerName: string;
  name: string;
  brand: string;
  horsepower: number;
  topSpeed: number;
  engine: string;
  description: string;
  rarity: string;
  unlockCost: number;
  createdAt: string;
}

function CustomVehicleCard({
  vehicle,
  onDelete,
  onPublish,
  publishing,
}: {
  vehicle: CustomVehicle;
  onDelete: () => void;
  onPublish: () => void;
  publishing: boolean;
}) {
  const { state, buyCustomVehicle } = useGameState();
  const count = (state.ownedCustomVehicles ?? []).filter(id => id === vehicle.id).length;
  const cost = Math.floor(vehicle.unlockCost * Math.pow(1.15, count));
  const canAfford = state.miles >= cost;
  const mps = vehicle.horsepower * 10;

  const rarityColors: Record<string, string> = {
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

  return (
    <div className={`relative rounded-xl border bg-card p-3 flex flex-col gap-2 transition-all ${rarityColors[vehicle.rarity]} ${rarityGlow[vehicle.rarity]}`}>
      {count > 0 && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-black px-1.5 py-0.5 rounded-full z-10">
          x{count}
        </div>
      )}

      <div className="w-full h-20 flex items-center justify-center bg-background/50 rounded-lg overflow-hidden">
        {vehicle.imagePath ? (
          <img src={vehicle.imagePath} alt={vehicle.name} className="h-full object-contain" />
        ) : (
          <div className="text-4xl">🔧</div>
        )}
      </div>

      <div>
        <div className="font-black text-white text-xs leading-tight">{vehicle.name}</div>
        <div className="text-[10px] text-muted-foreground">{vehicle.brand}</div>
        <Badge variant="outline" className={`mt-0.5 text-[9px] rarity-${vehicle.rarity} border-current/30 px-1 py-0 h-4`}>
          {vehicle.rarity}
        </Badge>
      </div>

      {vehicle.engine && (
        <div className="text-[9px] text-muted-foreground italic truncate">{vehicle.engine}</div>
      )}

      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <div className="bg-background/60 rounded p-1">
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">HP</div>
          <div className="font-bold text-red-400">{formatNumber(vehicle.horsepower)}</div>
        </div>
        <div className="bg-background/60 rounded p-1">
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">Top Speed</div>
          <div className="font-bold text-primary">{vehicle.topSpeed} mph</div>
        </div>
        <div className="bg-background/60 rounded p-1 col-span-2">
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">Miles/sec</div>
          <div className="font-bold text-accent">{formatNumber(mps)}/s</div>
        </div>
      </div>

      {vehicle.description && (
        <div className="text-[9px] text-muted-foreground leading-relaxed line-clamp-2">{vehicle.description}</div>
      )}

      <div className="flex gap-1.5 mt-auto flex-wrap">
        <Button
          onClick={() => buyCustomVehicle(vehicle.id)}
          disabled={!canAfford && vehicle.unlockCost > 0}
          size="sm"
          className={`
            flex-1 font-bold uppercase tracking-wider text-[10px] h-7 px-2
            ${canAfford || vehicle.unlockCost === 0
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-secondary text-muted-foreground cursor-not-allowed"}
          `}
        >
          {vehicle.unlockCost === 0 ? "Add to Garage" : `${formatNumber(cost)} mi`}
        </Button>
        <Button
          onClick={onPublish}
          disabled={publishing}
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[10px] border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
        >
          {publishing ? "…" : "🌐"}
        </Button>
        <Button
          onClick={onDelete}
          variant="destructive"
          size="sm"
          className="h-7 px-2 text-[10px]"
        >
          ✕
        </Button>
      </div>
    </div>
  );
}

function CommunityVehicleCard({ vehicle, onCopy }: { vehicle: CommunityVehicle; onCopy: () => void }) {
  const { state } = useGameState();
  const mps = vehicle.horsepower * 10;
  const alreadyHave = (state.customVehicles ?? []).some(v => v.name === vehicle.name && v.brand === vehicle.brand);

  const rarityColors: Record<string, string> = {
    common:   "border-border/50",
    rare:     "border-blue-500/30",
    legendary:"border-amber-500/40",
    prestige: "border-purple-500/50",
  };

  return (
    <div className={`rounded-xl border bg-card p-3 flex flex-col gap-2 ${rarityColors[vehicle.rarity] ?? "border-border/50"}`}>
      <div className="w-full h-16 flex items-center justify-center bg-background/50 rounded-lg">
        <div className="text-3xl">🔧</div>
      </div>

      <div>
        <div className="font-black text-white text-xs leading-tight">{vehicle.name}</div>
        <div className="text-[10px] text-muted-foreground">{vehicle.brand}</div>
        <div className="text-[9px] text-purple-400 mt-0.5">by {vehicle.playerName}</div>
        <Badge variant="outline" className={`mt-0.5 text-[9px] border-current/30 px-1 py-0 h-4`}>
          {vehicle.rarity}
        </Badge>
      </div>

      {vehicle.engine && (
        <div className="text-[9px] text-muted-foreground italic truncate">{vehicle.engine}</div>
      )}

      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <div className="bg-background/60 rounded p-1">
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">HP</div>
          <div className="font-bold text-red-400">{formatNumber(vehicle.horsepower)}</div>
        </div>
        <div className="bg-background/60 rounded p-1">
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">Top Speed</div>
          <div className="font-bold text-primary">{vehicle.topSpeed} mph</div>
        </div>
        <div className="bg-background/60 rounded p-1 col-span-2">
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">Miles/sec</div>
          <div className="font-bold text-accent">{formatNumber(mps)}/s</div>
        </div>
      </div>

      <Button
        onClick={onCopy}
        disabled={alreadyHave}
        size="sm"
        className="w-full font-bold uppercase tracking-wider text-[10px] h-7 bg-primary hover:bg-primary/90"
      >
        {alreadyHave ? "✓ Already Have" : "Copy to My Garage"}
      </Button>
    </div>
  );
}

type Tab = "mine" | "community";

export default function CustomGarage() {
  const { state, addCustomVehicle, deleteCustomVehicle } = useGameState();
  const [tab, setTab] = useState<Tab>("mine");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<CustomVehicle, "id" | "createdAt">>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [communityVehicles, setCommunityVehicles] = useState<CommunityVehicle[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);

  const customVehicles = state.customVehicles ?? [];

  const fetchCommunity = useCallback(async () => {
    setCommunityLoading(true);
    try {
      const res = await fetch("/api/community-vehicles");
      if (res.ok) {
        const data = await res.json();
        setCommunityVehicles(data);
      }
    } catch {
      // ignore
    } finally {
      setCommunityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "community") fetchCommunity();
  }, [tab, fetchCommunity]);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setForm(prev => ({ ...prev, imagePath: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.brand.trim()) return;
    const clamped = { ...form, horsepower: Math.min(form.horsepower, MAX_HP) };
    addCustomVehicle(clamped);
    setForm(EMPTY_FORM);
    setImagePreview(undefined);
    setShowForm(false);
  }

  async function handlePublish(vehicle: CustomVehicle) {
    setPublishingId(vehicle.id);
    setPublishMsg(null);
    try {
      const res = await fetch("/api/community-vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: state.playerId,
          playerName: state.playerName ?? "Anonymous",
          name: vehicle.name,
          brand: vehicle.brand,
          horsepower: Math.min(vehicle.horsepower, MAX_HP),
          topSpeed: vehicle.topSpeed,
          engine: vehicle.engine ?? "",
          description: vehicle.description ?? "",
          rarity: vehicle.rarity,
          unlockCost: vehicle.unlockCost,
        }),
      });
      if (res.ok) {
        setPublishMsg(`"${vehicle.name}" published to the community!`);
      } else {
        setPublishMsg("Failed to publish — try again.");
      }
    } catch {
      setPublishMsg("Failed to publish — try again.");
    } finally {
      setPublishingId(null);
      setTimeout(() => setPublishMsg(null), 4000);
    }
  }

  function handleCopyFromCommunity(cv: CommunityVehicle) {
    addCustomVehicle({
      name: cv.name,
      brand: cv.brand,
      horsepower: cv.horsepower,
      topSpeed: cv.topSpeed,
      engine: cv.engine,
      description: cv.description,
      rarity: cv.rarity as CustomVehicle["rarity"],
      unlockCost: cv.unlockCost,
      imagePath: undefined,
    });
  }

  return (
    <div className="flex flex-col gap-6 animated-bg">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">
          🔧 Custom Garage
        </h1>
        <p className="text-muted-foreground mt-1">
          Design custom vehicles, share them with the community, and use them on the Dyno.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setTab("mine")}
          className={`px-4 py-1.5 rounded-t-lg text-sm font-bold transition-colors ${tab === "mine" ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-white"}`}
        >
          My Builds ({customVehicles.length})
        </button>
        <button
          onClick={() => setTab("community")}
          className={`px-4 py-1.5 rounded-t-lg text-sm font-bold transition-colors ${tab === "community" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-muted-foreground hover:text-white"}`}
        >
          🌐 Community Builds
        </button>
      </div>

      {publishMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-emerald-300 text-sm font-bold">
          {publishMsg}
        </div>
      )}

      {/* MY BUILDS TAB */}
      {tab === "mine" && (
        <>
          <div className="flex gap-3 items-center">
            <Button
              onClick={() => setShowForm(v => !v)}
              className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-wider"
            >
              {showForm ? "✕ Cancel" : "+ Create Vehicle"}
            </Button>
            <span className="text-muted-foreground text-sm">{customVehicles.length} custom vehicle{customVehicles.length !== 1 ? "s" : ""} created</span>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col gap-4"
            >
              <h2 className="font-black uppercase tracking-wider text-white text-sm">New Custom Vehicle</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vehicle Name *</span>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Beast Mode One"
                    className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Manufacturer *</span>
                  <input
                    required
                    value={form.brand}
                    onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                    placeholder="e.g. Custom Garage Co."
                    className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Engine / Powertrain</span>
                  <input
                    value={form.engine}
                    onChange={e => setForm(p => ({ ...p, engine: e.target.value }))}
                    placeholder="e.g. Twin-turbo V8 + 3 turbojets"
                    className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Horsepower <span className="text-muted-foreground normal-case font-normal">(max 1 trillion)</span>
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={MAX_HP}
                    value={form.horsepower}
                    onChange={e => setForm(p => ({ ...p, horsepower: Math.min(Number(e.target.value) || 0, MAX_HP) }))}
                    className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  />
                  {form.horsepower >= MAX_HP && (
                    <span className="text-yellow-400 text-[9px]">⚠ Capped at 1,000,000,000,000 HP</span>
                  )}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Top Speed (mph)</span>
                  <input
                    type="number"
                    min={1}
                    value={form.topSpeed}
                    onChange={e => setForm(p => ({ ...p, topSpeed: Number(e.target.value) || 0 }))}
                    className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rarity</span>
                  <select
                    value={form.rarity}
                    onChange={e => setForm(p => ({ ...p, rarity: e.target.value as typeof form.rarity }))}
                    className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  >
                    {RARITY_OPTIONS.map(r => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Unlock Cost (miles, 0 = free)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.unlockCost}
                    onChange={e => setForm(p => ({ ...p, unlockCost: Number(e.target.value) || 0 }))}
                    className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</span>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe your creation…"
                    rows={2}
                    className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vehicle Image (optional)</span>
                <div
                  className="border-2 border-dashed border-border/50 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-24 object-contain rounded-lg" />
                  ) : (
                    <>
                      <div className="text-2xl">📷</div>
                      <p className="text-xs text-muted-foreground">Click to upload image (JPG, PNG, GIF…)</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              <div className="flex gap-3">
                <Button type="submit" className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-wider">
                  ✓ Create Vehicle
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setImagePreview(undefined); }}
                  className="font-bold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {customVehicles.length === 0 ? (
            <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🔧</div>
              <h3 className="font-black text-white text-lg mb-1">No Custom Vehicles Yet</h3>
              <p className="text-muted-foreground text-sm">Click "Create Vehicle" to build your first custom ride.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {customVehicles.map(vehicle => (
                <CustomVehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onDelete={() => deleteCustomVehicle(vehicle.id)}
                  onPublish={() => handlePublish(vehicle)}
                  publishing={publishingId === vehicle.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* COMMUNITY TAB */}
      {tab === "community" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground text-sm flex-1">
              Vehicles published by players worldwide. Copy any build to your garage and add it to your collection.
            </p>
            <Button
              onClick={fetchCommunity}
              variant="outline"
              size="sm"
              disabled={communityLoading}
              className="shrink-0"
            >
              {communityLoading ? "Loading…" : "↻ Refresh"}
            </Button>
          </div>

          {communityLoading ? (
            <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3 animate-spin">⚙️</div>
              <p className="text-muted-foreground text-sm">Loading community builds…</p>
            </div>
          ) : communityVehicles.length === 0 ? (
            <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="font-black text-white text-lg mb-1">No Community Builds Yet</h3>
              <p className="text-muted-foreground text-sm">Create a vehicle in "My Builds" and hit 🌐 to publish it!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {communityVehicles.map(cv => (
                <CommunityVehicleCard
                  key={cv.id}
                  vehicle={cv}
                  onCopy={() => handleCopyFromCommunity(cv)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-card border border-border/50 rounded-xl p-4 text-xs text-muted-foreground">
        <p className="font-bold text-white mb-1">Custom Vehicles</p>
        <p>Custom vehicles earn miles based on HP (1 HP = 10 miles/sec). Max HP is 1 trillion. Hit 🌐 to share your build with all players. Copied community vehicles go straight to your garage with free unlock. Use the Dyno to test your custom rides!</p>
      </div>
    </div>
  );
}
