/**
 * Sample CheapShark deals from Postgres, build product URLs, probe hit-rate.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/smoke-store-urls.ts
 *   npx tsx --env-file=.env.local scripts/smoke-store-urls.ts --per-store=8
 */
import postgres from "postgres";

import { getAppDatabaseUrl } from "../lib/db/database-url";
import { buildCheapsharkProductUrl } from "../lib/sources/cheapshark/store-url";

const perStore = Number.parseInt(
  process.argv.find((arg) => arg.startsWith("--per-store="))?.split("=")[1] ??
    "6",
  10,
);

const KNOWN_SAMPLES: Array<{
  storeName: string;
  title: string;
  steamAppId?: string | null;
  expectContains: string;
}> = [
  {
    storeName: "Epic Games Store",
    title: "Suicide Squad: Kill the Justice League - Digital Deluxe Edition",
    expectContains:
      "/p/suicide-squad-kill-the-justice-league--digital-deluxe-edition",
  },
  {
    storeName: "GOG",
    title: "Middle-earth: The Shadow Bundle",
    expectContains: "/en/game/middleearth_the_shadow_bundle",
  },
  {
    storeName: "GreenManGaming",
    title: "Watch_Dogs 2 Gold Edition",
    expectContains: "/games/watch-dogs-2-gold-edition/",
  },
  {
    storeName: "GamersGate",
    title: "Painkiller",
    expectContains: "/product/painkiller/",
  },
  {
    storeName: "GameBillet",
    title: "Ashen",
    expectContains: "gamebillet.com/ashen",
  },
  {
    storeName: "Fanatical",
    title: "NBA 2K26 Superstar Edition",
    expectContains: "/en/game/nba-2k26-superstar-edition",
  },
  {
    storeName: "Humble Store",
    title: "NBA 2K26 Superstar Edition",
    expectContains: "humblebundle.com/store/nba-2k26-superstar-edition",
  },
  {
    storeName: "Steam",
    title: "Any Steam title",
    steamAppId: "570",
    expectContains: "/app/570",
  },
];

async function probe(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { "user-agent": "gamesunder10-smoke-store-urls/1.0" },
      signal: AbortSignal.timeout(12_000),
    });
    // Treat 2xx/3xx as reachable product surface (stores often 302).
    const ok = res.status >= 200 && res.status < 400;
    return { ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function main() {
  console.log("=== Known slug fixtures ===");
  for (const sample of KNOWN_SAMPLES) {
    const built = buildCheapsharkProductUrl({
      storeName: sample.storeName,
      title: sample.title,
      steamAppId: sample.steamAppId ?? null,
    });
    const url = built?.url ?? null;
    const match = url?.includes(sample.expectContains) ?? false;
    console.log(
      `${match ? "OK" : "FAIL"} ${sample.storeName}: ${url ?? "(null)"}`,
    );
    if (!match) {
      console.error(`  expected to contain: ${sample.expectContains}`);
    }
  }

  const sql = postgres(getAppDatabaseUrl(), { max: 1, prepare: false });

  try {
    const rows = (await sql`
      SELECT store_name, title, steam_app_id
      FROM (
        SELECT
          store_name,
          title,
          steam_app_id,
          row_number() OVER (
            PARTITION BY store_name
            ORDER BY price_eur ASC, title ASC
          ) AS rn
        FROM deals
        WHERE source = 'cheapshark'
          AND price_eur <= 10
      ) ranked
      WHERE rn <= ${Math.max(1, Math.min(perStore, 20))}
      ORDER BY store_name, title
    `) as unknown as Array<{
      store_name: string;
      title: string;
      steam_app_id: string | null;
    }>;

    console.log(`\n=== Live DB sample (≤${perStore} per store) ===`);

    const byStore = new Map<
      string,
      { built: number; ok: number; omit: number; samples: string[] }
    >();

    for (const row of rows) {
      const stats = byStore.get(row.store_name) ?? {
        built: 0,
        ok: 0,
        omit: 0,
        samples: [],
      };

      const built = buildCheapsharkProductUrl({
        storeName: row.store_name,
        title: row.title,
        steamAppId: row.steam_app_id,
      });

      if (!built) {
        stats.omit += 1;
        byStore.set(row.store_name, stats);
        continue;
      }

      stats.built += 1;
      const { ok, status } = await probe(built.url);
      if (ok) {
        stats.ok += 1;
      }
      if (stats.samples.length < 2) {
        stats.samples.push(
          `${ok ? "ok" : "fail"}(${status}) ${row.title.slice(0, 40)} → ${built.url}`,
        );
      }
      byStore.set(row.store_name, stats);
    }

    for (const [store, stats] of [...byStore.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      const rate =
        stats.built > 0
          ? `${Math.round((stats.ok / stats.built) * 100)}%`
          : "n/a";
      console.log(
        `${store}: built=${stats.built} omit=${stats.omit} hit=${stats.ok}/${stats.built} (${rate})`,
      );
      for (const sample of stats.samples) {
        console.log(`  ${sample}`);
      }
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
