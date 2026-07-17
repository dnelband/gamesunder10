"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  countActiveFilters,
  FILTER_PLATFORMS,
  filtersToSearchParams,
  type DealListFilters,
} from "@/lib/deals/filters";

import { useDealsNav } from "./deals-nav";

interface DealFiltersProps {
  initialFilters: DealListFilters;
  availableGenres: string[];
  availablePlatforms: string[];
  /** Shown on the same row as Filters / Clear (e.g. result count). */
  summary?: ReactNode;
}

const RATING_OPTIONS = [
  { value: null, label: "Any" },
  { value: 50, label: "50+" },
  { value: 70, label: "70+" },
  { value: 80, label: "80+" },
  { value: 90, label: "90+" },
] as const;

const SEARCH_DEBOUNCE_MS = 300;

function toggleValue(values: string[], value: string): string[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }
  return [...values, value].sort();
}

export function DealFilters({
  initialFilters,
  availableGenres,
  availablePlatforms,
  summary,
}: DealFiltersProps) {
  const { navigate, isPending } = useDealsNav();
  const [open, setOpen] = useState(
    () => countActiveFilters(initialFilters) > 0,
  );
  const [filters, setFilters] = useState(initialFilters);
  const [searchText, setSearchText] = useState(initialFilters.q);
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
    if (searchText === filtersRef.current.q) {
      return;
    }

    const timer = setTimeout(() => {
      applyFilters({ ...filtersRef.current, q: searchText.trim() });
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

  const chipBase =
    "cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150";
  const chipActive = "border-accent bg-accent text-fg";
  const chipIdle =
    "border-stroke bg-surface-2 text-muted hover:border-muted hover:text-fg";

  return (
    <section className="flex flex-col gap-3" aria-busy={isPending}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-stroke bg-surface px-3 text-sm font-semibold text-fg transition-colors duration-150 hover:bg-surface-2"
            aria-expanded={open}
          >
            Filters
            {activeCount > 0 ? (
              <span className="rounded bg-accent px-1.5 py-0.5 text-[11px] font-semibold leading-none text-fg">
                {activeCount}
              </span>
            ) : null}
            <span className="text-muted" aria-hidden>
              {open ? "−" : "+"}
            </span>
          </button>

          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-9 items-center rounded-md border border-stroke px-3 text-sm font-medium text-muted transition-colors duration-150 hover:border-muted hover:text-fg"
            >
              Clear
            </button>
          ) : null}

          {isPending ? (
            <span className="text-[11px] font-medium text-accent">
              Updating…
            </span>
          ) : null}
        </div>

        {summary ? (
          <div className="text-sm text-muted">{summary}</div>
        ) : null}
      </div>

      {open ? (
        <div className="flex flex-col gap-5 rounded-lg border border-stroke bg-surface px-4 py-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Search
            </span>
            <input
              type="search"
              name="q"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Game title…"
              className="h-10 rounded-md border border-stroke bg-bg px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Platform
            </legend>
            <div className="flex flex-wrap gap-2">
              {platformChoices.map((platform) => {
                const checked = filters.platforms.includes(platform);
                return (
                  <label
                    key={platform}
                    className={`${chipBase} ${checked ? chipActive : chipIdle}`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() =>
                        update({
                          platforms: toggleValue(filters.platforms, platform),
                        })
                      }
                    />
                    {platform}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {availableGenres.length > 0 ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-[11px] font-medium uppercase tracking-wide text-muted">
                Genre
              </legend>
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                {availableGenres.map((genre) => {
                  const checked = filters.genres.includes(genre);
                  return (
                    <label
                      key={genre}
                      className={`${chipBase} ${checked ? chipActive : chipIdle}`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() =>
                          update({
                            genres: toggleValue(filters.genres, genre),
                          })
                        }
                      />
                      {genre}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          <fieldset className="flex flex-col gap-2">
            <legend className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Min rating
            </legend>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((option) => {
                const checked = filters.minRating === option.value;
                return (
                  <label
                    key={option.label}
                    className={`${chipBase} ${checked ? chipActive : chipIdle}`}
                  >
                    <input
                      type="radio"
                      name="minRating"
                      className="sr-only"
                      checked={checked}
                      onChange={() => update({ minRating: option.value })}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      ) : null}
    </section>
  );
}
