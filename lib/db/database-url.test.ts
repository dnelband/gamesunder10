import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getAppDatabaseUrl,
  getMigrateDatabaseUrl,
  isPooledDatabaseUrl,
} from "./database-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

function clearDbEnv() {
  for (const key of [
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
  ]) {
    delete process.env[key];
  }
}

describe("getAppDatabaseUrl", () => {
  it("prefers DATABASE_URL", () => {
    clearDbEnv();
    vi.stubEnv("DATABASE_URL", "postgres://app");
    expect(getAppDatabaseUrl()).toBe("postgres://app");
  });

  it("falls through POSTGRES_* when DATABASE_URL is unset", () => {
    clearDbEnv();
    vi.stubEnv("POSTGRES_URL", "postgres://pooler");
    expect(getAppDatabaseUrl()).toBe("postgres://pooler");
  });

  it("throws a clear error when nothing is set", () => {
    clearDbEnv();
    expect(() => getAppDatabaseUrl()).toThrow(/No database URL for app/);
  });
});

describe("getMigrateDatabaseUrl", () => {
  it("prefers non-pooling when DATABASE_URL is unset", () => {
    clearDbEnv();
    vi.stubEnv("POSTGRES_URL_NON_POOLING", "postgres://session");
    vi.stubEnv("POSTGRES_URL", "postgres://pooler");
    expect(getMigrateDatabaseUrl()).toBe("postgres://session");
  });

  it("throws a clear error when nothing is set", () => {
    clearDbEnv();
    expect(() => getMigrateDatabaseUrl()).toThrow(
      /No database URL for migrations/,
    );
  });
});

describe("isPooledDatabaseUrl", () => {
  it("detects pooler host, pgbouncer flag, and port 6543", () => {
    expect(
      isPooledDatabaseUrl("postgres://x.pooler.supabase.com/db"),
    ).toBe(true);
    expect(isPooledDatabaseUrl("postgres://localhost/db?pgbouncer=true")).toBe(
      true,
    );
    expect(isPooledDatabaseUrl("postgres://localhost:6543/db")).toBe(true);
    expect(isPooledDatabaseUrl("postgres://localhost:5432/db")).toBe(false);
  });
});
