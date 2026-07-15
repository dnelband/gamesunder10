import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

import { getMigrateDatabaseUrl } from "./lib/db/database-url";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getMigrateDatabaseUrl(),
  },
});
