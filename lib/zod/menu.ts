import z from "zod";
import { MenuItem } from "@/types";

const menuItemSchema: z.ZodType<MenuItem> = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number().optional(),
  parent_id: z.string().optional(),
  icon: z.string().optional(),
  url: z.string().optional(),
  children: z.lazy(() => z.array(menuItemSchema)).optional(),
  hidden: z.boolean().optional(),
}) satisfies z.ZodType<MenuItem>;

export const menuSchema = z.object({
  items: z.array(menuItemSchema),
});
