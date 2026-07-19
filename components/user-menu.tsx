"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { signOut } from "@/app/auth/actions";

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </svg>
  );
}

export function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stroke text-muted transition-colors hover:border-muted hover:text-fg"
        aria-label="Account menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
      >
        <UserIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-stroke bg-surface shadow-lg"
        >
          <div className="border-b border-stroke px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Signed in
            </p>
            <p className="mt-0.5 truncate text-sm text-fg" title={email}>
              {email}
            </p>
          </div>

          <Link
            href="/wishlist"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 text-sm text-fg transition-colors hover:bg-surface-2"
          >
            Wishlist
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="w-full px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
