"use client";

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
    });
  }

  const pillBase =
    "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors";
  const pillActive =
    "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900";
  const pillIdle =
    "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300";

  return (
    <section
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${
        isPending ? "opacity-80" : ""
      }`}
      aria-busy={isPending}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold">Filters</span>
          {activeCount > 0 ? (
            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
              {activeCount}
            </span>
          ) : null}
          {isPending ? (
            <span className="text-[11px] font-medium text-zinc-500">
              Updating…
            </span>
          ) : null}
        </span>
        <span className="text-sm text-zinc-500" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>

      {open ? (
        <div className="flex flex-col gap-5 border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Search
            </span>
            <input
              type="search"
              name="q"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Game title…"
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Platform
            </legend>
            <div className="flex flex-wrap gap-2">
              {platformChoices.map((platform) => {
                const checked = filters.platforms.includes(platform);
                return (
                  <label
                    key={platform}
                    className={`${pillBase} ${checked ? pillActive : pillIdle}`}
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
              <legend className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Genre
              </legend>
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                {availableGenres.map((genre) => {
                  const checked = filters.genres.includes(genre);
                  return (
                    <label
                      key={genre}
                      className={`${pillBase} ${checked ? pillActive : pillIdle}`}
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
            <legend className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Min rating
            </legend>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((option) => {
                const checked = filters.minRating === option.value;
                return (
                  <label
                    key={option.label}
                    className={`${pillBase} ${checked ? pillActive : pillIdle}`}
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

          {activeCount > 0 ? (
            <div>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex h-10 items-center rounded-full border border-zinc-200 px-5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
