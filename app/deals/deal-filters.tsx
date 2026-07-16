"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  countActiveFilters,
  FILTER_PLATFORMS,
  filtersToSearchParams,
  type DealListFilters,
} from "@/lib/deals/filters";

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
  const router = useRouter();
  const [open, setOpen] = useState(
    () => countActiveFilters(initialFilters) > 0,
  );
  const [searchText, setSearchText] = useState(initialFilters.q);

  const platformChoices = useMemo(() => {
    const fromDb = availablePlatforms.filter((platform) =>
      (FILTER_PLATFORMS as readonly string[]).includes(platform),
    );
    return fromDb.length > 0 ? fromDb : [...FILTER_PLATFORMS];
  }, [availablePlatforms]);

  const activeCount = countActiveFilters(initialFilters);

  function applyFilters(next: DealListFilters) {
    const params = filtersToSearchParams(next);
    const query = params.toString();
    router.push(query ? `/deals?${query}` : "/deals");
  }

  function update(partial: Partial<DealListFilters>) {
    applyFilters({ ...initialFilters, ...partial });
  }

  useEffect(() => {
    if (searchText === initialFilters.q) {
      return;
    }

    const timer = setTimeout(() => {
      applyFilters({ ...initialFilters, q: searchText.trim() });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // Only re-run when the typed search text changes; URL filters stay current
    // via initialFilters closure at debounce fire time through the key remounts.
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

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
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
                const checked = initialFilters.platforms.includes(platform);
                return (
                  <label
                    key={platform}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      checked
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() =>
                        update({
                          platforms: toggleValue(
                            initialFilters.platforms,
                            platform,
                          ),
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
                  const checked = initialFilters.genres.includes(genre);
                  return (
                    <label
                      key={genre}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        checked
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() =>
                          update({
                            genres: toggleValue(initialFilters.genres, genre),
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
                const checked = initialFilters.minRating === option.value;
                return (
                  <label
                    key={option.label}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      checked
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                    }`}
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
