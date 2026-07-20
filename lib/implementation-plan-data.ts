export type TaskStatus = "planned" | "in_progress" | "done" | "blocked";

export interface ImplementationTask {
  id: string;
  title: string;
  status: TaskStatus;
  notes?: string;
}

export interface ImplementationPhase {
  id: string;
  title: string;
  tasks: ImplementationTask[];
}

/**
 * Source of truth for /admin/status — keep in sync with what actually ships.
 * MVP: CheapShark (PC) + PSN + Xbox, deals UI, enrichment, product-first links.
 * Explicitly out of MVP: Nintendo eShop, ITAD.
 */
export const implementationPlan: ImplementationPhase[] = [
  {
    id: "foundation",
    title: "Foundation",
    tasks: [
      {
        id: "drizzle-setup",
        title: "Drizzle + Postgres client",
        status: "done",
      },
      {
        id: "source-health-table",
        title: "source_health table + recordSourceRun()",
        status: "done",
      },
      {
        id: "status-dashboard",
        title: "/admin/status (source health + plan)",
        status: "done",
        notes: "Moved under /admin with dashboard + stores.",
      },
      {
        id: "admin-shell",
        title: "/admin dashboard + ops pages",
        status: "done",
        notes:
          "No auth for now (no secrets on these pages). Public deals stay at /deals.",
      },
      {
        id: "user-auth",
        title: "Supabase Auth (email sign-in)",
        status: "done",
        notes:
          "Email password + magic link via @supabase/ssr. proxy.ts refreshes session. /login + header Sign in/out. Wishlist next.",
      },
      {
        id: "caching-rules",
        title: "Caching strategy (080-caching.mdc)",
        status: "done",
      },
    ],
  },
  {
    id: "ingestion",
    title: "Ingestion (MVP)",
    tasks: [
      {
        id: "cheapshark",
        title: "CheapShark fetcher + normalizer",
        status: "done",
        notes:
          "Run via npm run cron-local — CheapShark 429s from Vercel IPs.",
      },
      {
        id: "psn",
        title: "PSN scraper",
        status: "done",
        notes:
          "GraphQL categoryGridRetrieve, de-DE EUR, PS4/PS5 full games ≤€10; IGDB at cron; /api/cron/psn.",
      },
      {
        id: "xbox",
        title: "Xbox catalog browse",
        status: "done",
        notes:
          "Emerald browse de-DE/EUR; filter €0.01–10 on Series X|S / One. /api/cron/xbox daily.",
      },
      {
        id: "cron-routes",
        title: "Cron routes per source (CRON_SECRET)",
        status: "done",
        notes:
          "PSN + Xbox on Vercel Cron. CheapShark local only (429 from cloud).",
      },
      {
        id: "cron-orchestrator",
        title: "Cron scripts: remote + local",
        status: "done",
        notes:
          "npm run cron → psn/xbox. npm run cron-local → cheapshark. Headless Mac: scripts/run-local-cron.sh (+ launchd via install-local-cron-launchd.sh).",
      },
      {
        id: "deals-table",
        title: "deals table + upsert on ingestion",
        status: "done",
      },
      {
        id: "stale-deal-cleanup",
        title: "Stale deal cleanup after successful source sync",
        status: "done",
        notes:
          "syncSourceDeals(): upsert then DELETE absent IDs. Empty fetches never wipe.",
      },
    ],
  },
  {
    id: "app",
    title: "Deals app (MVP)",
    tasks: [
      {
        id: "deals-listing",
        title: "Deals listing page (server-side filters)",
        status: "done",
      },
      {
        id: "deals-perf",
        title: "Deals listing performance",
        status: "done",
      },
      {
        id: "game-grouping",
        title: "Group deals by game (platform-scoped, cheapest lead)",
        status: "done",
      },
      {
        id: "branding-v1",
        title: "Broke Gamer Arcade branding",
        status: "done",
      },
      {
        id: "distribution-format",
        title: "Physical vs digital indicator on deals",
        status: "done",
        notes: "Digital defaults for CS/PSN/Xbox. Physical badge ready for later sources.",
      },
      {
        id: "store-url-builders",
        title: "Per-store product URL builders (CheapShark)",
        status: "done",
        notes:
          "Render-time resolveOfferUrl. Product: Steam, Epic, GOG, GMG, GamersGate, Humble, Fanatical, GameBillet. Search fallback when product needs unknowable id or no builder yet.",
      },
      {
        id: "store-url-observability",
        title: "Store deal counts + builder coverage on /admin/stores",
        status: "done",
      },
      {
        id: "deal-genres",
        title: "Genre tags on deals",
        status: "done",
      },
      {
        id: "deal-rating",
        title: "Rating on deals",
        status: "done",
      },
      {
        id: "currency",
        title: "EUR conversion at ingestion",
        status: "done",
        notes: "Fixed USD→EUR via USD_TO_EUR_RATE; live FX later.",
      },
    ],
  },
  {
    id: "enrichment",
    title: "Enrichment",
    tasks: [
      {
        id: "igdb-auth",
        title: "IGDB Twitch OAuth + token cache",
        status: "done",
      },
      {
        id: "igdb-metadata",
        title: "Game metadata on deal views",
        status: "done",
        notes: "IGDB at cron only; snapshot on deals row.",
      },
    ],
  },
  {
    id: "deploy",
    title: "Deploy",
    tasks: [
      {
        id: "vercel-supabase",
        title: "Vercel + Supabase Postgres",
        status: "done",
        notes: "POSTGRES_* from Vercel integration; migrate locally against Supabase.",
      },
      {
        id: "cron-secret",
        title: "CRON_SECRET for production cron auth",
        status: "done",
      },
    ],
  },
  {
    id: "post-mvp",
    title: "Post-MVP / future",
    tasks: [
      {
        id: "eshop",
        title: "Nintendo eShop scraper",
        status: "planned",
        notes: "Explicitly out of MVP. Add when Switch coverage is wanted.",
      },
      {
        id: "itad",
        title: "IsThereAnyDeal fetcher + normalizer",
        status: "planned",
        notes: "Optional — CheapShark already covers most PC storefronts.",
      },
      {
        id: "store-url-remaining",
        title: "Product URLs for remaining CheapShark stores",
        status: "planned",
        notes:
          "Still search-only: WinGameStore (needs numeric id), Uplay, Gamesplanet, IndieGala. Add when product patterns are proven.",
      },
      {
        id: "affiliate-params",
        title: "Affiliate / referral params on outbound links",
        status: "planned",
        notes: "Single wrapper in resolveOfferUrl — do not store in DB.",
      },
      {
        id: "live-fx",
        title: "Live USD→EUR FX at ingestion",
        status: "planned",
        notes: "Replace fixed USD_TO_EUR_RATE.",
      },
      {
        id: "wishlist",
        title: "User wishlist (games not in deals yet)",
        status: "done",
        notes:
          "IGDB-backed. Add only from /wishlist search or empty deals search CTA — not from existing deal cards. Rejects add if game already under €10.",
      },
      {
        id: "wishlist-alerts",
        title: "Wishlist deal alerts (email)",
        status: "done",
        notes:
          "After CS/PSN/Xbox cron success: match wishlists → Resend email. Dedupe via lastNotifiedAt / lastNotifiedPriceEur (re-notify only on further drop). Needs RESEND_* + SUPABASE_SERVICE_ROLE_KEY.",
      },
      {
        id: "admin-auth",
        title: "Auth for /admin (shared secret or simple login)",
        status: "planned",
        notes: "Not needed while ops pages expose no secrets.",
      },
    ],
  },
];
