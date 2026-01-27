import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { MenuItem } from "@/types";

export const menu = pgTable("menu", {
  id: uuid().defaultRandom().primaryKey(),
  items: jsonb().$type<MenuItem[]>().notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
