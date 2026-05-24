import { Router } from "express";
import { db, leaderboardTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import {
  GetLeaderboardQueryParams,
  SubmitScoreBody,
  GetPlayerRankParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  const parsed = GetLeaderboardQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;

  const entries = await db
    .select()
    .from(leaderboardTable)
    .orderBy(desc(leaderboardTable.totalMiles))
    .limit(limit);

  res.json(
    entries.map((e) => ({
      ...e,
      updatedAt: e.updatedAt.toISOString(),
    }))
  );
});

router.post("/leaderboard", async (req, res) => {
  const body = SubmitScoreBody.parse(req.body);

  const existing = await db
    .select()
    .from(leaderboardTable)
    .where(eq(leaderboardTable.playerId, body.playerId))
    .limit(1);

  let entry;
  if (existing.length > 0) {
    const [updated] = await db
      .update(leaderboardTable)
      .set({
        playerName: body.playerName,
        totalMiles: body.totalMiles,
        prestigeLevel: body.prestigeLevel,
        carsOwned: body.carsOwned,
        updatedAt: new Date(),
      })
      .where(eq(leaderboardTable.playerId, body.playerId))
      .returning();
    entry = updated;
  } else {
    const [created] = await db
      .insert(leaderboardTable)
      .values({
        playerId: body.playerId,
        playerName: body.playerName,
        totalMiles: body.totalMiles,
        prestigeLevel: body.prestigeLevel,
        carsOwned: body.carsOwned,
      })
      .returning();
    entry = created;
  }

  res.json({ ...entry, updatedAt: entry.updatedAt.toISOString() });
});

router.get("/leaderboard/rank/:playerId", async (req, res) => {
  const { playerId } = GetPlayerRankParams.parse(req.params);

  const entry = await db
    .select()
    .from(leaderboardTable)
    .where(eq(leaderboardTable.playerId, playerId))
    .limit(1);

  if (entry.length === 0) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const rankResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(leaderboardTable)
    .where(sql`${leaderboardTable.totalMiles} > ${entry[0].totalMiles}`);

  const rank = Number(rankResult[0].count) + 1;

  res.json({
    rank,
    entry: { ...entry[0], updatedAt: entry[0].updatedAt.toISOString() },
  });
});

export default router;
