import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const communityVehiclesTable = pgTable("community_vehicles", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull(),
  playerName: text("player_name").notNull(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  horsepower: integer("horsepower").notNull(),
  topSpeed: integer("top_speed").notNull(),
  engine: text("engine").notNull().default(""),
  description: text("description").notNull().default(""),
  rarity: text("rarity").notNull().default("common"),
  unlockCost: integer("unlock_cost").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCommunityVehicleSchema = createInsertSchema(communityVehiclesTable).omit({ id: true, createdAt: true });
export type InsertCommunityVehicle = z.infer<typeof insertCommunityVehicleSchema>;
export type CommunityVehicle = typeof communityVehiclesTable.$inferSelect;
