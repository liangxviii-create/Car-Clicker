import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const savesTable = pgTable("saves", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull().unique(),
  saveData: text("save_data").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSaveSchema = createInsertSchema(savesTable).omit({ id: true, updatedAt: true });
export type InsertSave = z.infer<typeof insertSaveSchema>;
export type Save = typeof savesTable.$inferSelect;
