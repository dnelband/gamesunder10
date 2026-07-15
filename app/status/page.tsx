import { implementationPlan } from "@/lib/implementation-plan-data";
import {
  listSourceHealth,
  type SourceHealthRow,
  type SourceHealthStatus,
} from "@/lib/db/source-health";
import { DEAL_SOURCES } from "@/types/deal-source";
import { Suspense } from "react";

function statusBadgeClass(status: SourceHealthStatus | "unknown"): string {
  switch (status) {
    case "ok":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
    case "degraded":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    case "broken":
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

function taskStatusLabel(status: string): string {
  return status.replace("_", " ");
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

export default function StatusPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto px-6 py-12 text-zinc-600 dark:text-zinc-400">
          Loading status…
        </div>
      }
    >
      <StatusContent />
    </Suspense>
  );
}

async function StatusContent() {
  const sourceRows = mergeSourceRows(await listSourceHealth());

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Status</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Source health from real cron runs and implementation progress tracked
          in code.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Source health</h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
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
                <tr
                  key={row.source}
                  className="border-t border-zinc-200 dark:border-zinc-800"
                >
                  <td className="px-4 py-3 font-mono">{row.source}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(
                        row.status === "unknown" ? "unknown" : row.status,
                      )}`}
                    >
                      {row.status === "unknown" ? "not run" : row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatTimestamp(row.lastSuccessAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatTimestamp(row.lastFailureAt)}
                  </td>
                  <td className="px-4 py-3">{row.consecutiveFailures}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {row.lastError ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-medium">Implementation plan</h2>
        {implementationPlan.map((phase) => (
          <div key={phase.id} className="flex flex-col gap-3">
            <h3 className="text-lg font-medium">{phase.title}</h3>
            <ul className="flex flex-col gap-2">
              {phase.tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
                >
                  <span
                    className={`mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(
                      task.status === "done"
                        ? "ok"
                        : task.status === "blocked"
                          ? "broken"
                          : task.status === "in_progress"
                            ? "degraded"
                            : "unknown",
                    )}`}
                  >
                    {taskStatusLabel(task.status)}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span>{task.title}</span>
                    {task.notes ? (
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {task.notes}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
