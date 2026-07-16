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
        title: "/status dashboard (source health + plan)",
        status: "done",
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
    title: "Ingestion",
    tasks: [
      {
        id: "cheapshark",
        title: "CheapShark fetcher + normalizer",
        status: "done",
        notes:
          "Run via npm run cron-local against localhost — CheapShark 429s from Vercel IPs.",
      },
      {
        id: "itad",
        title: "IsThereAnyDeal fetcher + normalizer",
        status: "planned",
      },
      {
        id: "psn",
        title: "PSN scraper",
        status: "done",
        notes:
          "GraphQL categoryGridRetrieve, de-DE EUR, PS4/PS5 full games ≤€10; IGDB enrichment at cron with external ID lookup first, then conservative cleaned exact-title fallback; /api/cron/psn.",
      },
      {
        id: "xbox",
        title: "Xbox scraper",
        status: "planned",
      },
      {
        id: "eshop",
        title: "Nintendo eShop scraper",
        status: "planned",
      },
      {
        id: "cron-routes",
        title: "Cron routes per source (CRON_SECRET)",
        status: "in_progress",
        notes:
          "PSN on Vercel daily (Hobby). CheapShark local only (429 from cloud). ITAD/Xbox/eShop pending.",
      },
      {
        id: "cron-orchestrator",
        title: "Cron scripts: remote + local",
        status: "done",
        notes:
          "npm run cron → REMOTE_SOURCES (psn) via CRON_BASE_URL. npm run cron-local → LOCAL_SOURCES (cheapshark) via localhost.",
      },
      {
        id: "deals-table",
        title: "deals table + upsert on ingestion",
        status: "done",
      },
    ],
  },
  {
    id: "app",
    title: "Deals app",
    tasks: [
      {
        id: "deals-listing",
        title: "Deals listing page (server-side filters)",
        status: "done",
        notes:
          "Expandable filters + pagination (24/page) via URL searchParams.",
      },
      {
        id: "distribution-format",
        title: "Physical vs digital indicator on deals",
        status: "planned",
        notes: "Field + UI badge; critical for console sources (020-data-model.mdc).",
      },
      {
        id: "deal-genres",
        title: "Genre tags on deals (source first, IGDB fallback at cron)",
        status: "done",
      },
      {
        id: "deal-rating",
        title: "Rating on deals (source first, IGDB fallback at cron)",
        status: "done",
      },
      {
        id: "currency",
        title: "EUR conversion utility at ingestion",
        status: "done",
        notes: "Fixed USD→EUR rate via USD_TO_EUR_RATE env; replace with live FX later.",
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
        notes:
          "IGDB enrichment runs at cron only; description/cover/screenshots/genres/rating persisted on deals row. get-game-metadata.ts reserved for future wishlist.",
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
        status: "in_progress",
        notes: "POSTGRES_* from Vercel integration; migrations run locally against Supabase.",
      },
      {
        id: "cron-secret",
        title: "CRON_SECRET for production cron auth",
        status: "done",
      },
    ],
  },
];
