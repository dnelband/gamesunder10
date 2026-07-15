import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getAppDatabaseUrl, isPooledDatabaseUrl } from "./database-url";
import * as schema from "./schema";

const databaseUrl = getAppDatabaseUrl();

const client = postgres(databaseUrl, {
  max: 1,
  ssl: databaseUrl.includes("supabase") ? "require" : undefined,
  prepare: isPooledDatabaseUrl(databaseUrl) ? false : undefined,
});

export const db = drizzle(client, { schema });
