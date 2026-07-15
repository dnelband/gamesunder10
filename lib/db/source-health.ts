import { eq } from "drizzle-orm";

import type { DealSource } from "@/types/deal-source";

import { db } from "./client";
import { sourceHealth } from "./schema";

export type SourceHealthStatus = "ok" | "degraded" | "broken";

export interface SourceRunResult {
  success: boolean;
  error?: string;
  dealsIngested?: number;
}

export interface SourceHealthRow {
  source: string;
  status: SourceHealthStatus;
  lastRunAt: string;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  dealsIngestedLastRun: number | null;
}

export function deriveSourceStatus(
  consecutiveFailures: number,
  success: boolean,
): SourceHealthStatus {
  if (success) {
    return "ok";
  }
  if (consecutiveFailures >= 3) {
    return "broken";
  }
  if (consecutiveFailures >= 1) {
    return "degraded";
  }
  return "ok";
}

export async function listSourceHealth(): Promise<SourceHealthRow[]> {
  const rows = await db.select().from(sourceHealth);
  return rows.map((row) => ({
    source: row.source,
    status: row.status as SourceHealthStatus,
    lastRunAt: row.lastRunAt,
    lastSuccessAt: row.lastSuccessAt,
    lastFailureAt: row.lastFailureAt,
    lastError: row.lastError,
    consecutiveFailures: row.consecutiveFailures,
    dealsIngestedLastRun: row.dealsIngestedLastRun,
  }));
}

export async function recordSourceRun(
  source: DealSource,
  result: SourceRunResult,
): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(sourceHealth)
    .where(eq(sourceHealth.source, source))
    .limit(1);

  const previous = existing[0];
  const previousFailures = previous?.consecutiveFailures ?? 0;
  const consecutiveFailures = result.success ? 0 : previousFailures + 1;
  const status = deriveSourceStatus(consecutiveFailures, result.success);

  const row = {
    source,
    status,
    lastRunAt: now,
    lastSuccessAt: result.success ? now : (previous?.lastSuccessAt ?? null),
    lastFailureAt: result.success ? (previous?.lastFailureAt ?? null) : now,
    lastError: result.success ? null : (result.error ?? "Unknown error"),
    consecutiveFailures,
    dealsIngestedLastRun: result.dealsIngested ?? null,
  };

  await db
    .insert(sourceHealth)
    .values(row)
    .onConflictDoUpdate({
      target: sourceHealth.source,
      set: {
        status: row.status,
        lastRunAt: row.lastRunAt,
        lastSuccessAt: row.lastSuccessAt,
        lastFailureAt: row.lastFailureAt,
        lastError: row.lastError,
        consecutiveFailures: row.consecutiveFailures,
        dealsIngestedLastRun: row.dealsIngestedLastRun,
      },
    });
}
