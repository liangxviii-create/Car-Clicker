import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  offerPlayerId: text("offer_player_id").notNull(),
  offerPlayerName: text("offer_player_name").notNull(),
  offeredCarId: text("offered_car_id").notNull(),
  offeredCarName: text("offered_car_name").notNull(),
  wantedCarId: text("wanted_car_id").notNull(),
  wantedCarName: text("wanted_car_name").notNull(),
  acceptPlayerId: text("accept_player_id"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTradeSchema = createInsertSchema(tradesTable).omit({ id: true, createdAt: true, acceptPlayerId: true, status: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof tradesTable.$inferSelect;
