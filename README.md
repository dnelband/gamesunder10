# Broke Gamer

Next.js 16 site that aggregates current game deals **under €10** across PC storefronts (CheapShark) and console storefronts (PSN, Xbox; more sources as they land). Prices are normalized to EUR at ingestion time. Deal data lives in Postgres; rich metadata is enriched from IGDB during cron, not on every page view.

## Stack

- **Next.js 16** (App Router, Cache Components) + TypeScript + Tailwind
- **PostgreSQL** via Drizzle (typically Supabase on Vercel)
- **Supabase Auth** for wishlist / login
- **Cron ingestion** — never fetch storefronts from user-facing request paths

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in values (see below)
pnpm db:migrate              # apply Drizzle migrations
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy [`.env.example`](.env.example) to `.env.local`. Important variables:

| Variable | Purpose |
| --- | --- |
| `POSTGRES_URL` / `DATABASE_URL` | App DB (Vercel Supabase integration or override) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth (browser + SSR) |
| `SUPABASE_SERVICE_ROLE_KEY` | Wishlist alert emails (lookup user emails) |
| `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET` | Twitch/IGDB enrichment at cron |
| `CRON_SECRET` | Bearer token for `/api/cron/*` routes |
| `CRON_BASE_URL` | Target host for remote cron runs (production URL) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Optional wishlist deal alerts |
| `NEXT_PUBLIC_SITE_URL` | Absolute links in alert emails |

Do **not** wrap env values in quotes in Vercel — the browser and Node clients receive the literal characters.

## Cron / ingestion

Deal sources run only via cron route handlers (`/api/cron/<source>`), protected by `Authorization: Bearer $CRON_SECRET`.

[`scripts/cron-orchestrator.mjs`](scripts/cron-orchestrator.mjs) splits sources because some APIs rate-limit cloud IPs:

| Mode | Sources | Typical use |
| --- | --- | --- |
| **Remote** (`pnpm cron`) | `psn`, `xbox` | Hit `CRON_BASE_URL` (production) |
| **Local** (`pnpm cron-local`) | `cheapshark` | Hit `http://localhost:3000` with `pnpm dev` running |

Useful scripts:

```bash
pnpm cron              # remote sources → CRON_BASE_URL
pnpm cron-local        # CheapShark → localhost, verbose JSON
pnpm cron-local:quiet  # same, quieter
```

Vercel Cron can call the same `/api/cron/*` routes in production for remote-friendly sources; keep CheapShark on the local (or non-Vercel) path.

## Admin

Ops pages live under `/admin` (status, stores, implementation checklist). They are **not** linked from public nav. Auth is still planned — treat the routes as internal for now.

## Tests & lint

```bash
pnpm test
pnpm lint
```

`pnpm install` enables a Husky **pre-commit** hook that runs `pnpm lint` (fails the commit if lint fails).

## Deploy

Deploy on Vercel with the Supabase integration (or set `DATABASE_URL` / `POSTGRES_*` yourself). Set `CRON_SECRET` and wire Vercel Cron to the remote-friendly sources as needed.
