import { Router } from "express";
import { db, tradesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListTradesQueryParams,
  CreateTradeBody,
  AcceptTradeParams,
  AcceptTradeBody,
  CancelTradeParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/trades", async (req, res) => {
  const parsed = ListTradesQueryParams.safeParse(req.query);
  const playerId = parsed.success ? parsed.data.playerId : undefined;

  let trades;
  if (playerId) {
    trades = await db
      .select()
      .from(tradesTable)
      .where(and(eq(tradesTable.offerPlayerId, playerId), eq(tradesTable.status, "open")));
  } else {
    trades = await db
      .select()
      .from(tradesTable)
      .where(eq(tradesTable.status, "open"));
  }

  res.json(
    trades.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      acceptPlayerId: t.acceptPlayerId ?? null,
    }))
  );
});

router.post("/trades", async (req, res) => {
  const body = CreateTradeBody.parse(req.body);

  const [trade] = await db
    .insert(tradesTable)
    .values({
      offerPlayerId: body.offerPlayerId,
      offerPlayerName: body.offerPlayerName,
      offeredCarId: body.offeredCarId,
      offeredCarName: body.offeredCarName,
      wantedCarId: body.wantedCarId,
      wantedCarName: body.wantedCarName,
      status: "open",
    })
    .returning();

  res.status(201).json({ ...trade, createdAt: trade.createdAt.toISOString(), acceptPlayerId: null });
});

router.post("/trades/:tradeId/accept", async (req, res) => {
  const { tradeId } = AcceptTradeParams.parse(req.params);
  const body = AcceptTradeBody.parse(req.body);

  const existing = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.id, tradeId))
    .limit(1);

  if (existing.length === 0) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }

  if (existing[0].status !== "open") {
    res.status(409).json({ error: "Trade already completed" });
    return;
  }

  const [updated] = await db
    .update(tradesTable)
    .set({ status: "accepted", acceptPlayerId: body.acceptPlayerId })
    .where(eq(tradesTable.id, tradeId))
    .returning();

  res.json({ ...updated, createdAt: updated.createdAt.toISOString(), acceptPlayerId: updated.acceptPlayerId ?? null });
});

router.delete("/trades/:tradeId", async (req, res) => {
  const { tradeId } = CancelTradeParams.parse(req.params);

  const existing = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.id, tradeId))
    .limit(1);

  if (existing.length === 0) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }

  const [updated] = await db
    .update(tradesTable)
    .set({ status: "cancelled" })
    .where(eq(tradesTable.id, tradeId))
    .returning();

  res.json({ ...updated, createdAt: updated.createdAt.toISOString(), acceptPlayerId: updated.acceptPlayerId ?? null });
});

export default router;
