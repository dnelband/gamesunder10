<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Why this note exists: Next.js 16 (bundled docs under `node_modules/next/dist/docs/`) diverges from what most models assume from older App Router training data — e.g. always-async `params`/`searchParams`, `proxy.ts` instead of `middleware.ts`, Cache Components / explicit `'use cache'`. The instruction is intentional: check the real docs in this repo instead of pattern-matching stale APIs.
<!-- END:nextjs-agent-rules -->
