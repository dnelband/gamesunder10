"use client";

import { useEffect, useId, useRef } from "react";

import type { ChangelogRelease } from "@/lib/changelog";

interface ChangelogDialogProps {
  open: boolean;
  onClose: () => void;
  releases: ChangelogRelease[];
}

export function ChangelogDialog({
  open,
  onClose,
  releases,
}: ChangelogDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close changelog"
        className="absolute inset-0 bg-bg/80"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(80vh,36rem)] w-full max-w-lg flex-col rounded-lg border border-stroke bg-surface"
      >
        <div className="flex items-center justify-between gap-4 border-b border-stroke px-5 py-4">
          <h2 id={titleId} className="font-display text-xl font-bold text-fg">
            Changelog
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="cursor-pointer text-sm text-muted transition-colors hover:text-fg"
          >
            Close
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          <ChangelogReleaseList releases={releases} />
        </div>
      </div>
    </div>
  );
}

function ChangelogReleaseList({
  releases,
}: {
  releases: ChangelogRelease[];
}) {
  if (releases.length === 0) {
    return <p className="text-sm text-muted">No releases yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-8">
      {releases.map((release) => (
        <li key={release.version}>
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-display text-lg font-semibold text-fg">
              {release.version}
            </p>
            {release.date ? (
              <p className="text-sm text-muted">{release.date}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-4">
            {release.sections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 text-sm font-medium text-fg">
                  {section.title}
                </p>
                <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
