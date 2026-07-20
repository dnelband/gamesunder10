"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  countActiveFilters,
  FILTER_PLATFORMS,
  filtersToSearchParams,
  type DealListFilters,
} from "@/lib/deals/filters";
import { effectiveSearchQuery } from "@/lib/search-query";

import { useDealsNav } from "./deals-nav";

interface DealFiltersProps {
  initialFilters: DealListFilters;
  availableGenres: string[];
  availablePlatforms: string[];
}

const RATING_OPTIONS = [
  { value: null, label: "Any" },
  { value: 50, label: "50+" },
  { value: 70, label: "70+" },
  { value: 80, label: "80+" },
  { value: 90, label: "90+" },
] as const;

const SEARCH_DEBOUNCE_MS = 500;

function toggleValue(values: string[], value: string): string[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }
  return [...values, value].sort();
}

function filterTriggerLabel(
  label: string,
  count: number,
  fallback?: string | null,
): string {
  if (count > 0) {
    return `${label} (${count})`;
  }
  if (fallback) {
    return `${label}: ${fallback}`;
  }
  return label;
}

function selectedRatingLabel(value: number | null): string | null {
  return RATING_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-3.5 shrink-0 text-muted transition-transform duration-150 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function FilterDropdown({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onToggle();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onToggle();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onToggle]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
          open
            ? "border-accent bg-surface text-fg"
            : "border-stroke bg-surface text-muted hover:border-muted hover:text-fg"
        }`}
        aria-expanded={open}
      >
        {label}
        <ChevronDown open={open} />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 min-w-[16rem] rounded-lg border border-stroke bg-surface p-3 shadow-sm">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DealFilters({
  initialFilters,
  availableGenres,
  availablePlatforms,
}: DealFiltersProps) {
  const { navigate, isPending } = useDealsNav();
  const [filters, setFilters] = useState(initialFilters);
  const [searchText, setSearchText] = useState(initialFilters.q);
  const [openDropdown, setOpenDropdown] = useState<
    "platforms" | "genres" | "rating" | null
  >(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    setFilters(initialFilters);
    setSearchText(initialFilters.q);
  }, [
    initialFilters.q,
    initialFilters.minRating,
    // Stable string deps so URL sync doesn't loop on new object identity.
    initialFilters.platforms.join(","),
    initialFilters.genres.join(","),
  ]);

  const platformChoices = useMemo(() => {
    const fromDb = availablePlatforms.filter((platform) =>
      (FILTER_PLATFORMS as readonly string[]).includes(platform),
    );
    return fromDb.length > 0 ? fromDb : [...FILTER_PLATFORMS];
  }, [availablePlatforms]);

  const activeCount = countActiveFilters(filters);
  const ratingLabel = selectedRatingLabel(filters.minRating);

  function applyFilters(next: DealListFilters) {
    setFilters(next);
    const params = filtersToSearchParams(next);
    const query = params.toString();
    navigate(query ? `/deals?${query}` : "/deals");
  }

  function update(partial: Partial<DealListFilters>) {
    applyFilters({ ...filtersRef.current, ...partial });
  }

  useEffect(() => {
    const effectiveQ = effectiveSearchQuery(searchText);
    if (effectiveQ === filtersRef.current.q) {
      return;
    }

    const timer = setTimeout(() => {
      applyFilters({ ...filtersRef.current, q: effectiveQ });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce search only
  }, [searchText]);

  function onClear() {
    setSearchText("");
    applyFilters({
      q: "",
      platforms: [],
      genres: [],
      minRating: null,
      store: null,
    });
  }

  function removePlatform(platform: string) {
    update({ platforms: filters.platforms.filter((value) => value !== platform) });
  }

  function removeGenre(genre: string) {
    update({ genres: filters.genres.filter((value) => value !== genre) });
  }

  return (
    <section className="flex flex-col gap-3" aria-busy={isPending}>
      <div className="rounded-lg border border-stroke bg-surface px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              name="q"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search game title"
              aria-label="Search game title"
              className="h-10 min-w-[12rem] flex-1 rounded-md border border-stroke bg-bg px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
            />

            <FilterDropdown
              label={filterTriggerLabel("Platforms", filters.platforms.length)}
              open={openDropdown === "platforms"}
              onToggle={() =>
                setOpenDropdown((value) =>
                  value === "platforms" ? null : "platforms",
                )
              }
            >
              <fieldset className="flex max-h-56 flex-col gap-2 overflow-y-auto">
                <legend className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                  Platforms
                </legend>
                {platformChoices.map((platform) => (
                  <label
                    key={platform}
                    className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-fg hover:bg-surface-2"
                  >
                    <input
                      type="checkbox"
                      checked={filters.platforms.includes(platform)}
                      onChange={() =>
                        update({
                          platforms: toggleValue(filters.platforms, platform),
                        })
                      }
                    />
                    {platform}
                  </label>
                ))}
              </fieldset>
            </FilterDropdown>

            {availableGenres.length > 0 ? (
              <FilterDropdown
                label={filterTriggerLabel("Genres", filters.genres.length)}
                open={openDropdown === "genres"}
                onToggle={() =>
                  setOpenDropdown((value) => (value === "genres" ? null : "genres"))
                }
              >
                <fieldset className="flex max-h-56 flex-col gap-2 overflow-y-auto">
                  <legend className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                    Genres
                  </legend>
                  {availableGenres.map((genre) => (
                    <label
                      key={genre}
                      className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-fg hover:bg-surface-2"
                    >
                      <input
                        type="checkbox"
                        checked={filters.genres.includes(genre)}
                        onChange={() =>
                          update({
                            genres: toggleValue(filters.genres, genre),
                          })
                        }
                      />
                      {genre}
                    </label>
                  ))}
                </fieldset>
              </FilterDropdown>
            ) : null}

            <FilterDropdown
              label={filterTriggerLabel("Rating", 0, ratingLabel)}
              open={openDropdown === "rating"}
              onToggle={() =>
                setOpenDropdown((value) => (value === "rating" ? null : "rating"))
              }
            >
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                  Minimum rating
                </legend>
                {RATING_OPTIONS.map((option) => (
                  <label
                    key={option.label}
                    className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-fg hover:bg-surface-2"
                  >
                    <input
                      type="radio"
                      name="minRating"
                      checked={filters.minRating === option.value}
                      onChange={() => update({ minRating: option.value })}
                    />
                    {option.label}
                  </label>
                ))}
              </fieldset>
            </FilterDropdown>
          </div>

          {activeCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {filters.q ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchText("");
                    update({ q: "" });
                  }}
                  className="rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-fg"
                >
                  Search: {filters.q} ×
                </button>
              ) : null}
              {filters.platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => removePlatform(platform)}
                  className="rounded-md border border-stroke bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg"
                >
                  {platform} ×
                </button>
              ))}
              {filters.genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => removeGenre(genre)}
                  className="rounded-md border border-stroke bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg"
                >
                  {genre} ×
                </button>
              ))}
              {filters.minRating !== null ? (
                <button
                  type="button"
                  onClick={() => update({ minRating: null })}
                  className="rounded-md border border-stroke bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg"
                >
                  Rating: {ratingLabel} ×
                </button>
              ) : null}
              {filters.store ? (
                <button
                  type="button"
                  onClick={() => update({ store: null })}
                  className="rounded-md border border-stroke bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg"
                >
                  Store: {filters.store} ×
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClear}
                className="rounded-md border border-stroke px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-muted hover:text-fg"
              >
                Clear all
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
