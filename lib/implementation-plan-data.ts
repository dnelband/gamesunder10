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
        notes: "Retry with backoff on 429/502/503; 400ms between deal pages.",
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
          "GraphQL categoryGridRetrieve, de-DE EUR, PS4/PS5 full games ≤€10; IGDB enrichment at cron; /api/cron/psn.",
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
          "CheapShark + PSN routes. vercel.json: once daily on Hobby (06:00 + 06:30 UTC). More often: npm run cron locally or external cron.",
      },
      {
        id: "cron-orchestrator",
        title: "Single script to trigger all cron routes",
        status: "done",
        notes: "npm run cron — hits all /api/cron/* with CRON_SECRET; live elapsed per source. CRON_BASE_URL for production.",
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
        notes: "Vertical slice listing live; filters still basic.",
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
