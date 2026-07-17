import Link from "next/link";

import { implementationPlan } from "@/lib/implementation-plan-data";

const LINKS = [
  {
    href: "/admin/status",
    title: "Status",
    body: "Source health from cron runs and the implementation plan checklist.",
  },
  {
    href: "/admin/stores",
    title: "Stores",
    body: "Deal counts per storefront and product vs search link-builder coverage.",
  },
] as const;

export default function AdminPage() {
  const phases = implementationPlan;
  const tasks = phases.flatMap((phase) => phase.tasks);
  const done = tasks.filter((task) => task.status === "done").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const planned = tasks.filter((task) => task.status === "planned").length;
  const blocked = tasks.filter((task) => task.status === "blocked").length;
  const postMvp = phases.find((phase) => phase.id === "post-mvp");

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
          Admin
        </h1>
        <p className="text-muted">
          Ops overview for Broke Gamer. No auth for now — these pages do not
          expose secrets.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Done" value={done} />
        <Stat label="In progress" value={inProgress} />
        <Stat label="Planned" value={planned} />
        <Stat label="Blocked" value={blocked} />
      </dl>

      <section className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col gap-2 rounded-lg border border-stroke bg-surface px-5 py-4 transition-colors hover:border-muted"
          >
            <span className="font-display text-lg font-semibold text-fg">
              {link.title}
            </span>
            <span className="text-sm text-muted">{link.body}</span>
          </Link>
        ))}
      </section>

      {postMvp ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold text-fg">
            Post-MVP snapshot
          </h2>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            {postMvp.tasks.map((task) => (
              <li key={task.id} className="flex gap-2">
                <span className="shrink-0 font-mono text-xs uppercase text-muted">
                  {task.status.replace("_", " ")}
                </span>
                <span>{task.title}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stroke bg-surface px-4 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl font-semibold text-fg">
        {value}
      </dd>
    </div>
  );
}
