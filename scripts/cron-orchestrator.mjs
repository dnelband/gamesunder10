import { config } from "dotenv";

config({ path: ".env.local" });

/**
 * Remote (Vercel / CRON_BASE_URL): sources that tolerate cloud IPs.
 * Local (localhost): sources that rate-limit Vercel (CheapShark).
 * Keep in sync with the cron route files as new sources land.
 */
const REMOTE_SOURCES = ["psn", "xbox", "ebay"];
const LOCAL_SOURCES = ["cheapshark"];

function readEnv(name) {
  let value = process.env[name]?.trim();
  if (!value) {
    return undefined;
  }
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.length > 0 ? value : undefined;
}

function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const local = args.includes("--local");
  const verbose = args.includes("--verbose");
  let baseUrl = local
    ? "http://localhost:3000"
    : (readEnv("CRON_BASE_URL") ?? "http://localhost:3000");
  const sources = [...(local ? LOCAL_SOURCES : REMOTE_SOURCES)];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--local") {
      continue;
    }
    if (arg === "--url" || arg === "--base-url") {
      baseUrl = args[i + 1] ?? baseUrl;
      i += 1;
      continue;
    }
    if (arg === "--only") {
      const list = args[i + 1]?.split(",").map((s) => s.trim()).filter(Boolean);
      if (list?.length) {
        sources.length = 0;
        sources.push(...list);
      }
      i += 1;
    }
  }

  return {
    local,
    verbose,
    baseUrl: baseUrl.replace(/\/$/, ""),
    sources,
  };
}

function printBody(source, body) {
  console.log(`[${source}] response:`);
  console.log(JSON.stringify(body, null, 2));
}

async function runSource(source, baseUrl, secret, verbose) {
  const url = `${baseUrl}/api/cron/${source}`;
  const started = Date.now();
  let tick;

  process.stdout.write(`[${source}] starting…`);

  tick = setInterval(() => {
    const elapsed = formatDuration(Date.now() - started);
    process.stdout.write(`\r[${source}] running… ${elapsed}`);
  }, 500);

  try {
    const headers = secret ? { Authorization: `Bearer ${secret}` } : {};
    const response = await fetch(url, { headers });
    const body = await response.json().catch(() => ({}));
    const elapsed = formatDuration(Date.now() - started);

    clearInterval(tick);

    if (response.ok && body.ok) {
      const ingested = body.dealsIngested ?? 0;
      const deleted = body.dealsDeleted ?? 0;
      process.stdout.write(
        `\r[${source}] ✓ ${ingested} ingested, ${deleted} deleted in ${elapsed}\n`,
      );
      if (verbose) {
        printBody(source, body);
      }
      return {
        source,
        ok: true,
        dealsIngested: ingested,
        dealsDeleted: deleted,
        body,
        elapsedMs: Date.now() - started,
      };
    }

    const error = body.error ?? `HTTP ${response.status}`;
    process.stdout.write(`\r[${source}] ✗ failed in ${elapsed} — ${error}\n`);
    if (verbose) {
      printBody(source, body);
    }
    if (response.status === 401) {
      console.log(
        `           hint: CRON_SECRET on Vercel must match .env.local exactly, then redeploy`,
      );
    }
    return {
      source,
      ok: false,
      error,
      body,
      elapsedMs: Date.now() - started,
    };
  } catch (error) {
    clearInterval(tick);
    const elapsed = formatDuration(Date.now() - started);
    const message = error instanceof Error ? error.message : String(error);
    process.stdout.write(`\r[${source}] ✗ failed in ${elapsed} — ${message}\n`);
    return {
      source,
      ok: false,
      error: message,
      elapsedMs: Date.now() - started,
    };
  }
}

const { local, verbose, baseUrl, sources } = parseArgs();
const secret = readEnv("CRON_SECRET");

console.log(local ? "Cron local" : "Cron remote");
console.log(`  Base URL: ${baseUrl}`);
console.log(`  Sources:  ${sources.join(", ")}`);
console.log(`  Output:   ${verbose ? "verbose" : "summary"}`);
console.log(
  `  Auth:     ${secret ? "CRON_SECRET set" : "none (dev open if NODE_ENV=development)"}`,
);
console.log("");

const runStarted = Date.now();
const results = [];

for (const source of sources) {
  results.push(await runSource(source, baseUrl, secret, verbose));
}

const totalDeals = results.reduce(
  (sum, result) => sum + (result.dealsIngested ?? 0),
  0,
);
const totalDeleted = results.reduce(
  (sum, result) => sum + (result.dealsDeleted ?? 0),
  0,
);
const failed = results.filter((result) => !result.ok);
const succeeded = results.filter((result) => result.ok);

console.log("");
console.log("Summary");
console.log(`  OK:    ${succeeded.length}/${results.length} sources`);
console.log(`  Deals: ${totalDeals} ingested, ${totalDeleted} deleted`);
console.log(`  Time:  ${formatDuration(Date.now() - runStarted)}`);

if (failed.length > 0) {
  console.log("  Failed:");
  for (const result of failed) {
    console.log(`    - ${result.source}: ${result.error}`);
  }
  process.exit(1);
}

console.log("  Done.");
