import Link from "next/link";
import { Suspense } from "react";

import { implementationPlan } from "@/lib/implementation-plan-data";
import { cn } from "@/lib/cn";
import {
  listSourceHealth,
  type SourceHealthRow,
  type SourceHealthStatus,
} from "@/lib/db/source-health";
import { DEAL_SOURCES } from "@/types/deal-source";

function statusBadgeClass(status: SourceHealthStatus | "unknown"): string {
  switch (status) {
    case "ok":
      return "bg-cut/15 text-cut";
    case "degraded":
      return "bg-price/20 text-price";
    case "broken":
      return "bg-danger/15 text-danger";
    default:
      return "bg-surface-2 text-muted";
  }
}

function taskStatusLabel(status: string): string {
  return status.replace("_", " ");
}

function taskStatusBadgeKey(
  status: string,
): SourceHealthStatus | "unknown" {
  if (status === "done") {
    return "ok";
  }
  if (status === "blocked") {
    return "broken";
  }
  if (status === "in_progress") {
    return "degraded";
  }
  return "unknown";
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString();
}

function mergeSourceRows(rows: SourceHealthRow[]) {
  const bySource = new Map(rows.map((row) => [row.source, row]));

  return DEAL_SOURCES.map((source) => {
    const row = bySource.get(source);
    if (row) {
      return row;
    }

    return {
      source,
      status: "unknown" as const,
      lastRunAt: null,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastError: null,
      consecutiveFailures: 0,
      dealsIngestedLastRun: null,
    };
  });
}

export default function AdminStatusPage() {
  return (
    <Suspense
      fallback={<div className="text-muted">Loading status…</div>}
    >
      <StatusContent />
    </Suspense>
  );
}

async function StatusContent() {
  const sourceRows = mergeSourceRows(await listSourceHealth());
  const mvpPhases = implementationPlan.filter((phase) => phase.id !== "post-mvp");
  const postMvp = implementationPlan.find((phase) => phase.id === "post-mvp");

  return (
    <div className="flex flex-col gap-12">
      <StatusHeader />
      <SourceHealthSection sourceRows={sourceRows} />

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-xl font-semibold text-fg">
          Implementation plan (MVP)
        </h2>
        {mvpPhases.map((phase) => (
          <PlanPhase key={phase.id} phase={phase} />
        ))}
      </section>

      {postMvp ? <PostMvpSection phase={postMvp} /> : null}
    </div>
  );
}

function StatusHeader() {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
          Status
        </h1>
        <Link
          href="/admin/stores"
          className="text-sm text-muted transition-colors hover:text-fg"
        >
          Store link builders →
        </Link>
      </div>
      <p className="text-muted">
        Source health from real cron runs. Implementation checklist below —
        MVP is marked done; post-MVP lives in its own section.
      </p>
    </header>
  );
}

function SourceHealthSection({
  sourceRows,
}: {
  sourceRows: ReturnType<typeof mergeSourceRows>;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-semibold text-fg">
        Source health
      </h2>
      <div className="overflow-x-auto rounded-lg border border-stroke">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last success</th>
              <th className="px-4 py-3 font-medium">Last failure</th>
              <th className="px-4 py-3 font-medium">Failures</th>
              <th className="px-4 py-3 font-medium">Last error</th>
            </tr>
          </thead>
          <tbody>
            {sourceRows.map((row) => (
              <SourceHealthRowItem key={row.source} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SourceHealthRowItem({
  row,
}: {
  row: ReturnType<typeof mergeSourceRows>[number];
}) {
  return (
    <tr className="border-t border-stroke">
      <td className="px-4 py-3 font-mono text-fg">{row.source}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex rounded-md px-2.5 py-0.5 text-xs font-medium",
            statusBadgeClass(
              row.status === "unknown" ? "unknown" : row.status,
            ),
          )}
        >
          {row.status === "unknown" ? "not run" : row.status}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted">
        {formatTimestamp(row.lastSuccessAt)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted">
        {formatTimestamp(row.lastFailureAt)}
      </td>
      <td className="px-4 py-3 text-fg">{row.consecutiveFailures}</td>
      <td className="max-w-xs truncate px-4 py-3 text-muted">
        {row.lastError ?? "—"}
      </td>
    </tr>
  );
}

function PostMvpSection({
  phase,
}: {
  phase: (typeof implementationPlan)[number];
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-semibold text-fg">
          Post-MVP / future
        </h2>
        <p className="text-sm text-muted">
          Not in scope for MVP (eShop, ITAD, eBay physical, remaining store
          product URLs, affiliates, live FX, admin auth).
        </p>
      </div>
      <PlanPhase phase={phase} />
    </section>
  );
}

function PlanPhase({
  phase,
}: {
  phase: (typeof implementationPlan)[number];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-medium text-fg">{phase.title}</h3>
      <ul className="flex flex-col gap-2">
        {phase.tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-3 rounded-lg border border-stroke bg-surface px-4 py-3"
          >
            <span
              className={cn(
                "mt-0.5 inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                statusBadgeClass(taskStatusBadgeKey(task.status)),
              )}
            >
              {taskStatusLabel(task.status)}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-fg">{task.title}</span>
              {task.notes ? (
                <span className="text-sm text-muted">{task.notes}</span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
