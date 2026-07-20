"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  countActiveFilters,
  FILTER_PLATFORMS,
  filtersToSearchParams,
  type DealListFilters,
} from "@/lib/deals/filters";
import { clsx } from "clsx";
import {
  effectiveSearchQuery,
  SEARCH_DEBOUNCE_MS,
} from "@/lib/search-query";

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
      className={clsx(
        "size-3.5 shrink-0 text-muted transition-transform duration-150",
        open && "rotate-180",
      )}
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
        className={clsx(
          "inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
          open
            ? "border-accent bg-surface text-fg"
            : "border-stroke bg-surface text-muted hover:border-muted hover:text-fg",
        )}
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

type OpenDropdown = "platforms" | "genres" | "rating" | null;

function PlatformsDropdown({
  platformChoices,
  filters,
  open,
  onToggle,
  onUpdate,
}: {
  platformChoices: string[];
  filters: DealListFilters;
  open: boolean;
  onToggle: () => void;
  onUpdate: (partial: Partial<DealListFilters>) => void;
}) {
  return (
    <FilterDropdown
      label={filterTriggerLabel("Platforms", filters.platforms.length)}
      open={open}
      onToggle={onToggle}
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
                onUpdate({
                  platforms: toggleValue(filters.platforms, platform),
                })
              }
            />
            {platform}
          </label>
        ))}
      </fieldset>
    </FilterDropdown>
  );
}

function GenresDropdown({
  availableGenres,
  filters,
  open,
  onToggle,
  onUpdate,
}: {
  availableGenres: string[];
  filters: DealListFilters;
  open: boolean;
  onToggle: () => void;
  onUpdate: (partial: Partial<DealListFilters>) => void;
}) {
  return (
    <FilterDropdown
      label={filterTriggerLabel("Genres", filters.genres.length)}
      open={open}
      onToggle={onToggle}
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
                onUpdate({ genres: toggleValue(filters.genres, genre) })
              }
            />
            {genre}
          </label>
        ))}
      </fieldset>
    </FilterDropdown>
  );
}

function RatingDropdown({
  filters,
  ratingLabel,
  open,
  onToggle,
  onUpdate,
}: {
  filters: DealListFilters;
  ratingLabel: string | null;
  open: boolean;
  onToggle: () => void;
  onUpdate: (partial: Partial<DealListFilters>) => void;
}) {
  return (
    <FilterDropdown
      label={filterTriggerLabel("Rating", 0, ratingLabel)}
      open={open}
      onToggle={onToggle}
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
              onChange={() => onUpdate({ minRating: option.value })}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    </FilterDropdown>
  );
}

function ActiveFilterPills({
  filters,
  ratingLabel,
  onClearSearch,
  onRemovePlatform,
  onRemoveGenre,
  onRemoveRating,
  onRemoveStore,
  onClearAll,
}: {
  filters: DealListFilters;
  ratingLabel: string | null;
  onClearSearch: () => void;
  onRemovePlatform: (platform: string) => void;
  onRemoveGenre: (genre: string) => void;
  onRemoveRating: () => void;
  onRemoveStore: () => void;
  onClearAll: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.q ? (
        <button
          type="button"
          onClick={onClearSearch}
          className="rounded-md border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-fg"
        >
          Search: {filters.q} ×
        </button>
      ) : null}
      {filters.platforms.map((platform) => (
        <button
          key={platform}
          type="button"
          onClick={() => onRemovePlatform(platform)}
          className="rounded-md border border-stroke bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg"
        >
          {platform} ×
        </button>
      ))}
      {filters.genres.map((genre) => (
        <button
          key={genre}
          type="button"
          onClick={() => onRemoveGenre(genre)}
          className="rounded-md border border-stroke bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg"
        >
          {genre} ×
        </button>
      ))}
      {filters.minRating !== null ? (
        <button
          type="button"
          onClick={onRemoveRating}
          className="rounded-md border border-stroke bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg"
        >
          Rating: {ratingLabel} ×
        </button>
      ) : null}
      {filters.store ? (
        <button
          type="button"
          onClick={onRemoveStore}
          className="rounded-md border border-stroke bg-surface-2 px-3 py-1.5 text-xs font-medium text-fg"
        >
          Store: {filters.store} ×
        </button>
      ) : null}
      <button
        type="button"
        onClick={onClearAll}
        className="rounded-md border border-stroke px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-muted hover:text-fg"
      >
        Clear all
      </button>
    </div>
  );
}

function useDealFiltersState(initialFilters: DealListFilters) {
  const { navigate } = useDealsNav();
  const [filters, setFilters] = useState(initialFilters);
  const [searchText, setSearchText] = useState(initialFilters.q);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Adjust state during render when the URL hands us new filters (stable key),
  // rather than syncing via an effect.
  const initialKey = [
    initialFilters.q,
    initialFilters.minRating ?? "",
    initialFilters.platforms.join(","),
    initialFilters.genres.join(","),
    initialFilters.store ?? "",
  ].join("|");
  const [prevInitialKey, setPrevInitialKey] = useState(initialKey);
  if (initialKey !== prevInitialKey) {
    setPrevInitialKey(initialKey);
    setFilters(initialFilters);
    setSearchText(initialFilters.q);
  }

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

  return {
    filters,
    searchText,
    setSearchText,
    update,
    onClear,
    removePlatform,
    removeGenre,
  };
}

function SearchAndDropdownsRow({
  searchText,
  onSearchTextChange,
  platformChoices,
  availableGenres,
  filters,
  ratingLabel,
  onUpdate,
}: {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  platformChoices: string[];
  availableGenres: string[];
  filters: DealListFilters;
  ratingLabel: string | null;
  onUpdate: (partial: Partial<DealListFilters>) => void;
}) {
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);

  function toggleDropdown(value: NonNullable<OpenDropdown>) {
    setOpenDropdown((current) => (current === value ? null : value));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        name="q"
        value={searchText}
        onChange={(event) => onSearchTextChange(event.target.value)}
        placeholder="Search game title"
        aria-label="Search game title"
        className="h-10 min-w-[12rem] flex-1 rounded-md border border-stroke bg-bg px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
      />

      <PlatformsDropdown
        platformChoices={platformChoices}
        filters={filters}
        open={openDropdown === "platforms"}
        onToggle={() => toggleDropdown("platforms")}
        onUpdate={onUpdate}
      />

      {availableGenres.length > 0 ? (
        <GenresDropdown
          availableGenres={availableGenres}
          filters={filters}
          open={openDropdown === "genres"}
          onToggle={() => toggleDropdown("genres")}
          onUpdate={onUpdate}
        />
      ) : null}

      <RatingDropdown
        filters={filters}
        ratingLabel={ratingLabel}
        open={openDropdown === "rating"}
        onToggle={() => toggleDropdown("rating")}
        onUpdate={onUpdate}
      />
    </div>
  );
}

export function DealFilters({
  initialFilters,
  availableGenres,
  availablePlatforms,
}: DealFiltersProps) {
  const { isPending } = useDealsNav();
  const {
    filters,
    searchText,
    setSearchText,
    update,
    onClear,
    removePlatform,
    removeGenre,
  } = useDealFiltersState(initialFilters);

  const platformChoices = useMemo(() => {
    const fromDb = availablePlatforms.filter((platform) =>
      (FILTER_PLATFORMS as readonly string[]).includes(platform),
    );
    return fromDb.length > 0 ? fromDb : [...FILTER_PLATFORMS];
  }, [availablePlatforms]);

  const activeCount = countActiveFilters(filters);
  const ratingLabel = selectedRatingLabel(filters.minRating);

  return (
    <section className="flex flex-col gap-3" aria-busy={isPending}>
      <div className="rounded-lg border border-stroke bg-surface px-4 py-4">
        <div className="flex flex-col gap-3">
          <SearchAndDropdownsRow
            searchText={searchText}
            onSearchTextChange={setSearchText}
            platformChoices={platformChoices}
            availableGenres={availableGenres}
            filters={filters}
            ratingLabel={ratingLabel}
            onUpdate={update}
          />

          {activeCount > 0 ? (
            <ActiveFilterPills
              filters={filters}
              ratingLabel={ratingLabel}
              onClearSearch={() => {
                setSearchText("");
                update({ q: "" });
              }}
              onRemovePlatform={removePlatform}
              onRemoveGenre={removeGenre}
              onRemoveRating={() => update({ minRating: null })}
              onRemoveStore={() => update({ store: null })}
              onClearAll={onClear}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
