import { describe, expect, it } from "vitest";

import { matchWishlistDealFromRows } from "./wishlists";

type MatchRow = Parameters<typeof matchWishlistDealFromRows>[1][number];

function row(
  overrides: Partial<MatchRow> & Pick<MatchRow, "id" | "title" | "normalizedTitle">,
): MatchRow {
  return {
    source: "cheapshark",
    storeName: "Steam",
    steamAppId: null,
    externalStoreUid: null,
    priceEur: 5,
    originalPriceEur: 20,
    url: "https://example.com",
    imageUrl: null,
    sourceReleaseDate: null,
    distributionFormat: "digital",
    genres: [],
    platforms: ["PC"],
    rating: null,
    ratingSource: null,
    ...overrides,
  };
}

describe("matchWishlistDealFromRows", () => {
  it("returns null match for empty rows", () => {
    const result = matchWishlistDealFromRows(
      { title: "Hollow Knight", steamAppId: "367520" },
      [],
    );
    expect(result.match).toBeNull();
    expect(result.matchedVia).toBeNull();
  });

  it("prefers Steam id matches over title", () => {
    const rows = [
      row({
        id: "steam",
        title: "Hollow Knight",
        normalizedTitle: "hollow knight",
        steamAppId: "367520",
        priceEur: 8,
      }),
      row({
        id: "title-only",
        title: "Hollow Knight Deluxe Edition",
        normalizedTitle: "hollow knight deluxe edition",
        steamAppId: null,
        priceEur: 3,
      }),
    ];

    const result = matchWishlistDealFromRows(
      { title: "Hollow Knight", steamAppId: "367520" },
      rows,
    );
    expect(result.matchedVia).toBe("steam");
    expect(result.steamDealCount).toBe(1);
    expect(result.match?.minPriceEur).toBe(8);
  });

  it("matches deluxe/ultimate editions by canonical title", () => {
    const rows = [
      row({
        id: "deluxe",
        title: "SYNDUALITY: Echo of Ada Deluxe Edition",
        normalizedTitle: "synduality echo of ada deluxe edition",
        steamAppId: null,
        priceEur: 7,
      }),
    ];

    const result = matchWishlistDealFromRows(
      { title: "SYNDUALITY: Echo of Ada", steamAppId: null },
      rows,
    );
    expect(result.matchedVia).toBe("title");
    expect(result.match?.minPriceEur).toBe(7);
  });

  it("does not match unrelated titles", () => {
    const rows = [
      row({
        id: "silksong",
        title: "Hollow Knight Silksong",
        normalizedTitle: "hollow knight silksong",
        steamAppId: null,
      }),
    ];

    const result = matchWishlistDealFromRows(
      { title: "Hollow Knight", steamAppId: null },
      rows,
    );
    expect(result.match).toBeNull();
    expect(result.matchedVia).toBeNull();
  });
});
