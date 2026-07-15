import {
  doublePrecision,
  index,
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

export const deals = pgTable(
  "deals",
  {
    id: text("id").primaryKey(),
    source: text("source").notNull(),
    title: text("title").notNull(),
    normalizedTitle: text("normalized_title").notNull(),
    steamAppId: text("steam_app_id"),
    storeName: text("store_name").notNull(),
    priceEur: doublePrecision("price_eur").notNull(),
    originalPriceEur: doublePrecision("original_price_eur").notNull(),
    discountPercent: integer("discount_percent").notNull(),
    currencyOriginal: text("currency_original").notNull(),
    url: text("url").notNull(),
    imageUrl: text("image_url"),
    region: text("region"),
    sourceReleaseDate: text("source_release_date"),
    genres: text("genres").array().notNull().default([]),
    rating: doublePrecision("rating"),
    ratingSource: text("rating_source"),
    fetchedAt: timestamp("fetched_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("deals_price_eur_idx").on(table.priceEur),
    index("deals_normalized_title_idx").on(table.normalizedTitle),
    index("deals_steam_app_id_idx").on(table.steamAppId),
    index("deals_source_release_date_idx").on(table.sourceReleaseDate),
    index("deals_rating_idx").on(table.rating),
  ],
);
