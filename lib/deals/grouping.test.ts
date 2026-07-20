import { describe, expect, it } from "vitest";

import {
  buildGroupKey,
  groupDealsIntoOffers,
  parseGroupKey,
  platformFamily,
  type DealForGrouping,
} from "./grouping";

function listing(
  overrides: Partial<DealForGrouping> & Pick<DealForGrouping, "id" | "title">,
): DealForGrouping {
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
    normalizedTitle: overrides.title.toLowerCase(),
    ...overrides,
  };
}

describe("platformFamily", () => {
  it("classifies PC platforms as pc", () => {
    expect(platformFamily(["PC"])).toBe("pc");
  });

  it("classifies console platforms as console", () => {
    expect(platformFamily(["PS5"])).toBe("console");
    expect(platformFamily(["Xbox Series X|S", "PC"])).toBe("console");
  });
});

describe("buildGroupKey / parseGroupKey", () => {
  it("round-trips steam keys for pc", () => {
    const key = buildGroupKey({
      platforms: ["PC"],
      steamAppId: "12345",
      normalizedTitle: "some game",
    });
    expect(key).toBe("pc~s~12345");
    expect(parseGroupKey(key)).toEqual({
      family: "pc",
      steamAppId: "12345",
      normalizedTitle: null,
    });
  });

  it("round-trips steam keys for console", () => {
    const key = buildGroupKey({
      platforms: ["PS5"],
      steamAppId: "999",
      normalizedTitle: "ignored when steam present",
    });
    expect(key).toBe("console~s~999");
    expect(parseGroupKey(key)).toEqual({
      family: "console",
      steamAppId: "999",
      normalizedTitle: null,
    });
  });

  it("round-trips title keys with base64url encoding", () => {
    const normalizedTitle = "echo of ada";
    const key = buildGroupKey({
      platforms: ["PC"],
      steamAppId: null,
      normalizedTitle,
    });
    expect(key).toMatch(/^pc~t~/);
    expect(parseGroupKey(key)).toEqual({
      family: "pc",
      steamAppId: null,
      normalizedTitle,
    });
  });

  it("returns null for invalid keys", () => {
    expect(parseGroupKey("")).toBeNull();
    expect(parseGroupKey("pc~s")).toBeNull();
    expect(parseGroupKey("mobile~s~1")).toBeNull();
    expect(parseGroupKey("pc~x~abc")).toBeNull();
    expect(parseGroupKey("pc~t~")).toBeNull();
  });
});

describe("groupDealsIntoOffers", () => {
  it("groups deals with the same Steam id into one offer", () => {
    const offers = groupDealsIntoOffers([
      listing({
        id: "a",
        title: "Game A",
        steamAppId: "100",
        priceEur: 8,
        storeName: "Steam",
      }),
      listing({
        id: "b",
        title: "Game A",
        steamAppId: "100",
        priceEur: 4,
        storeName: "Humble Store",
      }),
    ]);

    expect(offers).toHaveLength(1);
    expect(offers[0].offerCount).toBe(2);
    expect(offers[0].minPriceEur).toBe(4);
    expect(offers[0].offers[0].id).toBe("b");
  });

  it("uses cheapest deal as lead and unknown format when mixed", () => {
    const offers = groupDealsIntoOffers([
      listing({
        id: "digital",
        title: "Mixed",
        steamAppId: "200",
        priceEur: 6,
        distributionFormat: "digital",
      }),
      listing({
        id: "physical",
        title: "Mixed",
        steamAppId: "200",
        priceEur: 9,
        distributionFormat: "physical",
      }),
    ]);

    expect(offers[0].distributionFormat).toBe("unknown");
    expect(offers[0].title).toBe("Mixed");
    expect(offers[0].offers.map((o) => o.id)).toEqual([
      "digital",
      "physical",
    ]);
  });

  it("sorts offers by original price then release date", () => {
    const offers = groupDealsIntoOffers([
      listing({
        id: "cheap-old",
        title: "Old Cheap",
        steamAppId: "1",
        originalPriceEur: 15,
        sourceReleaseDate: "2020-01-01",
      }),
      listing({
        id: "pricey-new",
        title: "New Pricey",
        steamAppId: "2",
        originalPriceEur: 40,
        sourceReleaseDate: "2024-06-01",
      }),
      listing({
        id: "pricey-older",
        title: "Older Pricey",
        steamAppId: "3",
        originalPriceEur: 40,
        sourceReleaseDate: "2023-01-01",
      }),
    ]);

    expect(offers.map((o) => o.offers[0].id)).toEqual([
      "pricey-new",
      "pricey-older",
      "cheap-old",
    ]);
  });
});
