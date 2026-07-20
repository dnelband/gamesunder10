import { describe, expect, it, vi } from "vitest";

import { normalizeCheapsharkDeal } from "./normalize";
import type { CheapsharkDeal } from "./schema";

function deal(overrides: Partial<CheapsharkDeal> = {}): CheapsharkDeal {
  return {
    dealID: "deal-1",
    internalName: "GAME",
    title: "Test Game",
    storeID: "1",
    salePrice: "5.00",
    normalPrice: "20.00",
    savings: "75.0",
    steamAppID: "123",
    thumb: "https://example.com/thumb.jpg",
    releaseDate: 0,
    metacriticScore: "0",
    steamRatingPercent: "0",
    ...overrides,
  };
}

describe("normalizeCheapsharkDeal", () => {
  const stores = new Map([["1", "Steam"]]);

  it("normalizes a valid under-€10 deal", () => {
    vi.stubEnv("USD_TO_EUR_RATE", "1");
    const result = normalizeCheapsharkDeal(deal(), stores);
    expect(result).not.toBeNull();
    expect(result?.priceEur).toBe(5);
    expect(result?.platforms).toEqual(["PC"]);
    expect(result?.storeName).toBe("Steam");
    vi.unstubAllEnvs();
  });

  it("drops deals above MAX_PRICE_EUR", () => {
    vi.stubEnv("USD_TO_EUR_RATE", "1");
    expect(
      normalizeCheapsharkDeal(deal({ salePrice: "10.01" }), stores),
    ).toBeNull();
    vi.unstubAllEnvs();
  });

  it("prefers metacritic over steam rating", () => {
    vi.stubEnv("USD_TO_EUR_RATE", "1");
    const result = normalizeCheapsharkDeal(
      deal({ metacriticScore: "88", steamRatingPercent: "95" }),
      stores,
    );
    expect(result?.rating).toBe(88);
    expect(result?.ratingSource).toBe("metacritic");
    vi.unstubAllEnvs();
  });

  it("falls back to steam rating when metacritic is missing", () => {
    vi.stubEnv("USD_TO_EUR_RATE", "1");
    const result = normalizeCheapsharkDeal(
      deal({ steamRatingPercent: "91" }),
      stores,
    );
    expect(result?.rating).toBe(91);
    expect(result?.ratingSource).toBe("steam");
    vi.unstubAllEnvs();
  });

  it("maps unix releaseDate to ISO date", () => {
    vi.stubEnv("USD_TO_EUR_RATE", "1");
    const result = normalizeCheapsharkDeal(
      deal({ releaseDate: 1_704_067_200 }),
      stores,
    );
    expect(result?.sourceReleaseDate).toBe("2024-01-01");
    vi.unstubAllEnvs();
  });

  it("falls back to Store {id} when the store map misses", () => {
    vi.stubEnv("USD_TO_EUR_RATE", "1");
    const result = normalizeCheapsharkDeal(deal({ storeID: "99" }), new Map());
    expect(result?.storeName).toBe("Store 99");
    vi.unstubAllEnvs();
  });
});
