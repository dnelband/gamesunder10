import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

function readEnv(name) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function getMigrateDatabaseUrl() {
  return (
    readEnv("DATABASE_URL") ??
    readEnv("POSTGRES_URL_NON_POOLING") ??
    readEnv("POSTGRES_URL")
  );
}

const databaseUrl = getMigrateDatabaseUrl();
if (!databaseUrl) {
  console.error(
    "No database URL found. Set POSTGRES_URL_NON_POOLING (from Vercel Supabase integration).",
  );
  process.exit(1);
}

const isPooled =
  databaseUrl.includes("pooler.supabase.com") ||
  databaseUrl.includes("pgbouncer=true") ||
  /:6543(\/|$|\?)/.test(databaseUrl);

const sql = postgres(databaseUrl, {
  max: 1,
  ssl: databaseUrl.includes("supabase") ? "require" : undefined,
  prepare: isPooled ? false : undefined,
});

try {
  console.log("Dropping app tables and Drizzle migration history…");
  await sql.unsafe(`DROP TABLE IF EXISTS "deals" CASCADE`);
  await sql.unsafe(`DROP TABLE IF EXISTS "source_health" CASCADE`);
  await sql.unsafe(`DROP SCHEMA IF EXISTS "drizzle" CASCADE`);
  console.log("Database reset complete. Run: npm run db:migrate");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("tenant/user") || message.includes("ENOTFOUND")) {
    console.error(
      "\nCould not reach Postgres. Ensure the Supabase project is active and POSTGRES_URL_NON_POOLING is set.\n",
    );
  }
  throw error;
} finally {
  await sql.end();
}
