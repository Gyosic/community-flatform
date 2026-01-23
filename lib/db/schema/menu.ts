import { jsonb, pgTable, uuid } from "drizzle-orm/pg-core";
import { MenuItem } from "@/types";

export const menus = pgTable("menus", {
  id: uuid().defaultRandom().primaryKey(),
  items: jsonb().$type<MenuItem[]>().notNull(),
});
