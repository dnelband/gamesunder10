import Link from "next/link";
import type { ReactNode } from "react";

import { BrandWordmark } from "@/components/brand-wordmark";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/status", label: "Status" },
  { href: "/admin/stores", label: "Stores" },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Link href="/admin" className="w-fit">
            <BrandWordmark size="sm" />
          </Link>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Admin
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-muted">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/deals" className="transition-colors hover:text-fg">
            Deals →
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
