# Broke Gamer

**v1.0.0** — Next.js 16 site that aggregates current game deals **under €10** across PC storefronts (CheapShark) and console storefronts (PSN, Xbox; more sources as they land). Prices are normalized to EUR at ingestion time. Deal data lives in Postgres; rich metadata is enriched from IGDB during cron, not on every page view.

> The npm package / repo folder may still say `gamesunder10` — that is the old project name. The product is **Broke Gamer**.

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
pnpm test:watch
pnpm test:coverage
pnpm lint
```

Unit tests run with **Vitest** (`lib/**/*.test.ts`). `pnpm test:coverage` fails if total **statements** coverage drops below **80%**. `pnpm typecheck` runs `next typegen` then `tsc` (needed so `PageProps` route types exist). `pnpm install` enables a Husky **pre-commit** hook that runs `pnpm lint && pnpm test`. GitHub Actions CI runs lint + coverage + typecheck on push/PR.

## Versioning

Versions are bumped **automatically** by [release-please](https://github.com/googleapis/release-please) from [Conventional Commits](https://www.conventionalcommits.org/) on `main`.

| Commit prefix | Bump |
| --- | --- |
| `fix:` | patch (`1.0.0` → `1.0.1`) |
| `feat:` | minor (`1.0.0` → `1.1.0`) |
| `feat!:` / `BREAKING CHANGE:` | major (`1.0.0` → `2.0.0`) |

**Flow:** merge feature PRs with conventional commit messages → release-please opens a **Release PR** that updates `package.json`, `CHANGELOG.md`, and the manifest → merge that PR → GitHub Release + `v*` tag are created. The site footer reads those files, so the new version shows after deploy.

**GitHub setup (one-time):**

1. **Settings → Actions → General → Workflow permissions**
   - Read and write permissions
   - ✅ **Allow GitHub Actions to create and approve pull requests**
2. Bootstrap the current release so history isn’t re-released: create a GitHub Release / tag **`v1.0.0`** on the commit that shipped 1.0.0 (or current `main` if that’s the baseline).

Examples:

```bash
git commit -m "fix: modal close uses pointer cursor"
git commit -m "feat: wishlist empty-state suggestions"
git commit -m "feat!: drop ebay source"
```

Do **not** hand-edit the version in `package.json` for normal releases.

## Git workflow

Work on a feature branch and merge to `main` via pull request. Protect `main` in GitHub (**Settings → Branches** / **Rules**) so direct pushes are blocked and CI must pass before merge.

## Deploy

Deploy on Vercel with the Supabase integration (or set `DATABASE_URL` / `POSTGRES_*` yourself). Set `CRON_SECRET` and wire Vercel Cron to the remote-friendly sources as needed.
