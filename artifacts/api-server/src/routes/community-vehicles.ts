import { Router } from "express";
import { db, communityVehiclesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router = Router();

const VALID_RARITIES = ["common", "rare", "legendary", "prestige"] as const;

function validateBody(body: unknown): { playerId: string; playerName: string; name: string; brand: string; horsepower: number; topSpeed: number; engine: string; description: string; rarity: string; unlockCost: number } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.playerId !== "string" || !b.playerId) return null;
  if (typeof b.playerName !== "string" || !b.playerName) return null;
  if (typeof b.name !== "string" || !b.name) return null;
  if (typeof b.brand !== "string" || !b.brand) return null;
  const hp = Number(b.horsepower);
  if (!Number.isFinite(hp) || hp < 1 || hp > 1_000_000_000_000) return null;
  const ts = Number(b.topSpeed);
  if (!Number.isFinite(ts) || ts < 1) return null;
  const rarity = typeof b.rarity === "string" && (VALID_RARITIES as readonly string[]).includes(b.rarity) ? b.rarity : "common";
  return {
    playerId: String(b.playerId),
    playerName: String(b.playerName),
    name: String(b.name),
    brand: String(b.brand),
    horsepower: Math.floor(hp),
    topSpeed: Math.floor(ts),
    engine: typeof b.engine === "string" ? b.engine : "",
    description: typeof b.description === "string" ? b.description : "",
    rarity,
    unlockCost: Math.max(0, Math.floor(Number(b.unlockCost) || 0)),
  };
}

// GET /api/community-vehicles
router.get("/community-vehicles", async (req, res) => {
  try {
    const vehicles = await db
      .select()
      .from(communityVehiclesTable)
      .orderBy(desc(communityVehiclesTable.createdAt))
      .limit(100);
    res.json(vehicles);
  } catch (err) {
    req.log.error(err, "Failed to fetch community vehicles");
    res.status(500).json({ error: "Failed to fetch community vehicles" });
  }
});

// POST /api/community-vehicles
router.post("/community-vehicles", async (req, res) => {
  const data = validateBody(req.body);
  if (!data) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  try {
    // Replace existing entry from same player
    await db
      .delete(communityVehiclesTable)
      .where(eq(communityVehiclesTable.playerId, data.playerId));

    const [vehicle] = await db
      .insert(communityVehiclesTable)
      .values(data)
      .returning();
    res.json(vehicle);
  } catch (err) {
    req.log.error(err, "Failed to create community vehicle");
    res.status(500).json({ error: "Failed to create community vehicle" });
  }
});

export default router;
