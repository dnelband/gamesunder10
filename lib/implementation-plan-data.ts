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
    ],
  },
  {
    id: "ingestion",
    title: "Ingestion",
    tasks: [
      {
        id: "cheapshark",
        title: "CheapShark fetcher + normalizer",
        status: "planned",
      },
      {
        id: "itad",
        title: "IsThereAnyDeal fetcher + normalizer",
        status: "planned",
      },
      {
        id: "psn",
        title: "PSN scraper",
        status: "planned",
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
        status: "planned",
      },
      {
        id: "deals-table",
        title: "deals table + upsert on ingestion",
        status: "planned",
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
        status: "planned",
      },
      {
        id: "currency",
        title: "EUR conversion utility at ingestion",
        status: "planned",
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
        status: "planned",
      },
      {
        id: "igdb-metadata",
        title: "Live game metadata on deal views",
        status: "planned",
      },
    ],
  },
];
