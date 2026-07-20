import { describe, expect, it } from "vitest";

import { normalizeXboxProduct } from "./normalize";
import type { EmeraldProductSummary } from "./schema";

function product(
  overrides: Partial<EmeraldProductSummary> = {},
): EmeraldProductSummary {
  return {
    productId: "9PP5G1F0C2B6",
    title: "Xbox Game",
    productKind: "Game",
    availableOn: ["XboxSeriesX"],
    categories: ["Action"],
    averageRating: 4.5,
    specificPrices: {
      purchaseable: [
        {
          listPrice: 8.99,
          msrp: 29.99,
          discountPercentage: 70,
          currency: "EUR",
        },
      ],
    },
    ...overrides,
  };
}

describe("normalizeXboxProduct — happy path", () => {
  it("normalizes a purchasable under-€10 game", () => {
    const result = normalizeXboxProduct(product());
    expect(result).not.toBeNull();
    expect(result?.priceEur).toBe(8.99);
    expect(result?.platforms).toEqual(["Xbox Series X|S"]);
    expect(result?.rating).toBe(90);
    expect(result?.ratingSource).toBe("store");
  });

  it("maps Xbox One platforms and protocol-relative images", () => {
    const result = normalizeXboxProduct(
      product({
        availableOn: ["XboxOne"],
        averageRating: null,
        images: { poster: { url: "//cdn.example/poster.jpg" } },
      }),
    );
    expect(result?.platforms).toEqual(["Xbox One"]);
    expect(result?.imageUrl).toBe("https://cdn.example/poster.jpg");
    expect(result?.rating).toBeNull();
  });

  it("includes both Xbox platforms when available", () => {
    const result = normalizeXboxProduct(
      product({ availableOn: ["XboxSeriesX", "XboxOne"] }),
    );
    expect(result?.platforms).toEqual(["Xbox Series X|S", "Xbox One"]);
  });
});

describe("normalizeXboxProduct — rejects", () => {
  it("drops free or over-budget prices", () => {
    expect(
      normalizeXboxProduct(
        product({
          specificPrices: {
            purchaseable: [
              { listPrice: 0, msrp: 10, currency: "EUR" },
            ],
          },
        }),
      ),
    ).toBeNull();

    expect(
      normalizeXboxProduct(
        product({
          specificPrices: {
            purchaseable: [
              { listPrice: 10.01, msrp: 40, currency: "EUR" },
            ],
          },
        }),
      ),
    ).toBeNull();
  });

  it("drops non-game product kinds", () => {
    expect(normalizeXboxProduct(product({ productKind: "App" }))).toBeNull();
  });

  it("drops non-EUR purchase currency and missing purchaseable", () => {
    expect(
      normalizeXboxProduct(
        product({
          specificPrices: {
            purchaseable: [
              { listPrice: 5, msrp: 20, currency: "USD" },
            ],
          },
        }),
      ),
    ).toBeNull();

    expect(
      normalizeXboxProduct(product({ specificPrices: { purchaseable: [] } })),
    ).toBeNull();
  });
});
