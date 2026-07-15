function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function isPoolerUrl(url: string): boolean {
  return (
    url.includes("pooler.supabase.com") ||
    url.includes("pgbouncer=true") ||
    /:6543(\/|$|\?)/.test(url)
  );
}

function missingDatabaseUrlError(context: "app" | "migrate"): never {
  throw new Error(
    context === "migrate"
      ? "No database URL for migrations. Set DATABASE_URL or POSTGRES_URL_NON_POOLING (Vercel Supabase integration)."
      : "No database URL for app. Set DATABASE_URL or POSTGRES_URL (Vercel Supabase integration).",
  );
}

/** App runtime — Vercel injects POSTGRES_URL (transaction pooler, port 6543). */
export function getAppDatabaseUrl(): string {
  return (
    readEnv("DATABASE_URL") ??
    readEnv("POSTGRES_URL") ??
    readEnv("POSTGRES_PRISMA_URL") ??
    readEnv("POSTGRES_URL_NON_POOLING") ??
    missingDatabaseUrlError("app")
  );
}

/**
 * Migrations / db:reset — use POSTGRES_URL_NON_POOLING (session pooler, port 5432).
 * Do not prefer db.* POSTGRES_HOST; it often doesn't resolve on Supabase/Vercel setups.
 */
export function getMigrateDatabaseUrl(): string {
  return (
    readEnv("DATABASE_URL") ??
    readEnv("POSTGRES_URL_NON_POOLING") ??
    readEnv("POSTGRES_URL") ??
    missingDatabaseUrlError("migrate")
  );
}

export function isPooledDatabaseUrl(url: string): boolean {
  return isPoolerUrl(url);
}
