import { Router } from "express";
import { db, savesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpsertPlayerSaveParams, UpsertPlayerSaveBody, GetPlayerSaveParams } from "@workspace/api-zod";

const router = Router();

router.get("/saves/:playerId", async (req, res) => {
  const { playerId } = GetPlayerSaveParams.parse(req.params);

  const saves = await db
    .select()
    .from(savesTable)
    .where(eq(savesTable.playerId, playerId))
    .limit(1);

  if (saves.length === 0) {
    res.status(404).json({ error: "No save found" });
    return;
  }

  const save = saves[0];
  res.json({ ...save, updatedAt: save.updatedAt.toISOString() });
});

router.put("/saves/:playerId", async (req, res) => {
  const { playerId } = UpsertPlayerSaveParams.parse(req.params);
  const body = UpsertPlayerSaveBody.parse(req.body);

  const existing = await db
    .select()
    .from(savesTable)
    .where(eq(savesTable.playerId, playerId))
    .limit(1);

  let save;
  if (existing.length > 0) {
    const [updated] = await db
      .update(savesTable)
      .set({ saveData: body.saveData, updatedAt: new Date() })
      .where(eq(savesTable.playerId, playerId))
      .returning();
    save = updated;
  } else {
    const [created] = await db
      .insert(savesTable)
      .values({ playerId, saveData: body.saveData })
      .returning();
    save = created;
  }

  res.json({ ...save, updatedAt: save.updatedAt.toISOString() });
});

export default router;
