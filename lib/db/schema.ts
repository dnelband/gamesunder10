import {
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const sourceHealth = pgTable("source_health", {
  source: text("source").primaryKey(),
  status: text("status").notNull(),
  lastRunAt: timestamp("last_run_at", { withTimezone: true, mode: "string" })
    .notNull(),
  lastSuccessAt: timestamp("last_success_at", {
    withTimezone: true,
    mode: "string",
  }),
  lastFailureAt: timestamp("last_failure_at", {
    withTimezone: true,
    mode: "string",
  }),
  lastError: text("last_error"),
  consecutiveFailures: integer("consecutive_failures").notNull().default(0),
  dealsIngestedLastRun: integer("deals_ingested_last_run"),
});
