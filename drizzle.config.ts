import type { Config } from "drizzle-kit";
import { postgresql } from "./config";

export default {
  dialect: "postgresql",
  schema: "./lib/db/schema",
  out: "./drizzle",
  migrations: {
    schema: "public",
  },
  dbCredentials: postgresql,
  strict: true,
  extensionsFilters: ["postgis"],
} satisfies Config;
