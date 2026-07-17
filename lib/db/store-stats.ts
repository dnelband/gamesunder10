import { sql } from "drizzle-orm";

import {
  linkBuilderStatusForStore,
  type LinkBuilderStatus,
} from "@/lib/sources/cheapshark/store-registry";

import { db } from "./client";

export interface StoreDealStat {
  source: string;
  storeName: string;
  dealCount: number;
  builder: LinkBuilderStatus;
}

export async function listStoreDealStats(): Promise<StoreDealStat[]> {
  const rows = await db.execute<{
    source: string;
    store_name: string;
    deal_count: number;
  }>(sql`
    SELECT
      source,
      store_name,
      count(*)::int AS deal_count
    FROM deals
    GROUP BY source, store_name
    ORDER BY deal_count DESC, store_name ASC
  `);

  return rows.map((row) => ({
    source: row.source,
    storeName: row.store_name,
    dealCount: row.deal_count,
    builder: linkBuilderStatusForStore({
      source: row.source,
      storeName: row.store_name,
    }),
  }));
}
