import { describe, expect, it } from "vitest";

import {
  countActiveFilters,
  dealsHrefForStore,
  filtersToSearchParams,
  parseDealFilters,
  parsePage,
} from "./filters";

describe("parseDealFilters / filtersToSearchParams", () => {
  it("round-trips active filters", () => {
    const filters = parseDealFilters({
      q: "  hades  ",
      platform: ["PC", "PS5"],
      genre: "Action,RPG",
      minRating: "75",
      store: " Steam ",
    });

    expect(filters).toEqual({
      q: "hades",
      platforms: ["PC", "PS5"],
      genres: ["Action", "RPG"],
      minRating: 75,
      store: "Steam",
    });

    const params = filtersToSearchParams(filters, 2);
    expect(params.get("q")).toBe("hades");
    expect(params.getAll("platform").sort()).toEqual(["PC", "PS5"]);
    expect(params.getAll("genre").sort()).toEqual(["Action", "RPG"]);
    expect(params.get("minRating")).toBe("75");
    expect(params.get("store")).toBe("Steam");
    expect(params.get("page")).toBe("2");

    const asRecord: Record<string, string | string[]> = {};
    for (const [key, value] of params.entries()) {
      const existing = asRecord[key];
      if (existing === undefined) {
        asRecord[key] = value;
      } else if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        asRecord[key] = [existing, value];
      }
    }
    expect(parseDealFilters(asRecord)).toEqual(filters);
  });

  it("drops single-character search and invalid platforms", () => {
    expect(
      parseDealFilters({ q: "x", platform: "Dreamcast", minRating: "0" }),
    ).toEqual({
      q: "",
      platforms: [],
      genres: [],
      minRating: null,
      store: null,
    });
  });
});

describe("parsePage", () => {
  it("defaults to 1 and clamps invalid values", () => {
    expect(parsePage({})).toBe(1);
    expect(parsePage({ page: "0" })).toBe(1);
    expect(parsePage({ page: "-3" })).toBe(1);
    expect(parsePage({ page: "abc" })).toBe(1);
    expect(parsePage({ page: "4" })).toBe(4);
  });
});

describe("countActiveFilters", () => {
  it("counts each active filter dimension once", () => {
    expect(
      countActiveFilters({
        q: "",
        platforms: [],
        genres: [],
        minRating: null,
        store: null,
      }),
    ).toBe(0);

    expect(
      countActiveFilters({
        q: "ab",
        platforms: ["PC", "PS5"],
        genres: ["Action"],
        minRating: 70,
        store: "Steam",
      }),
    ).toBe(5);
  });
});

describe("dealsHrefForStore", () => {
  it("deep-links admin store names into /deals", () => {
    expect(dealsHrefForStore("Steam")).toBe("/deals?store=Steam");
  });
});
