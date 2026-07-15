import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../lib/sources/cheapshark/stores.json");

async function fetchWithRetry(url, attempts = 5) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      return response;
    }
    if (attempt === attempts || ![429, 502, 503, 504].includes(response.status)) {
      throw new Error(`stores refresh failed: ${response.status}`);
    }
    const waitMs = Math.min(1000 * 2 ** (attempt - 1), 30_000);
    console.warn(`HTTP ${response.status}, retry ${attempt}/${attempts} in ${waitMs}ms`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  throw new Error("stores refresh failed");
}

const response = await fetchWithRetry(
  "https://www.cheapshark.com/api/1.0/stores",
);
const json = await response.json();
const stores = json.map((store) => ({
  storeID: store.storeID,
  storeName: store.storeName,
}));

writeFileSync(outPath, `${JSON.stringify(stores, null, 2)}\n`);
console.log(`Wrote ${stores.length} stores → ${outPath}`);
