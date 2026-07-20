import { describe, expect, it } from "vitest";

import { normalizePsnProduct } from "./normalize";
import type { PsnProduct } from "./schema";

function product(overrides: Partial<PsnProduct> = {}): PsnProduct {
  return {
    id: "UP0001-CUSA12345_00-GAME000000000000",
    name: "PS Game",
    platforms: ["PS5"],
    storeDisplayClassification: "FULL_GAME",
    npTitleId: "CUSA12345_00",
    media: [],
    price: {
      basePrice: "€19,99",
      discountText: "-50%",
      discountedPrice: "€9,99",
      isFree: false,
    },
    ...overrides,
  };
}

describe("normalizePsnProduct — happy path", () => {
  it("normalizes a full-game under-€10 deal", () => {
    const result = normalizePsnProduct(product());
    expect(result).not.toBeNull();
    expect(result?.priceEur).toBe(9.99);
    expect(result?.platforms).toEqual(["PS5"]);
    expect(result?.url).toContain(
      "/product/UP0001-CUSA12345_00-GAME000000000000",
    );
  });

  it("picks the first matching image role", () => {
    const result = normalizePsnProduct(
      product({
        media: [
          {
            role: "EDITION_KEY_ART",
            type: "IMAGE",
            url: "https://cdn.example/art.jpg",
          },
        ],
      }),
    );
    expect(result?.imageUrl).toBe("https://cdn.example/art.jpg");
  });
});

describe("normalizePsnProduct — rejects", () => {
  it("drops free games", () => {
    expect(
      normalizePsnProduct(
        product({
          price: {
            basePrice: "€0,00",
            discountText: null,
            discountedPrice: "€0,00",
            isFree: true,
          },
        }),
      ),
    ).toBeNull();
  });

  it("drops deals above MAX_PRICE_EUR", () => {
    expect(
      normalizePsnProduct(
        product({
          price: {
            basePrice: "€29,99",
            discountText: "-50%",
            discountedPrice: "€14,99",
            isFree: false,
          },
        }),
      ),
    ).toBeNull();
  });

  it("drops non-full-game classifications", () => {
    expect(
      normalizePsnProduct(
        product({ storeDisplayClassification: "ADD_ON" }),
      ),
    ).toBeNull();
  });
});

describe("normalizePsnProduct — pricing details", () => {
  it("computes discount from base/sale when discountText is missing", () => {
    const result = normalizePsnProduct(
      product({
        price: {
          basePrice: "€20,00",
          discountText: null,
          discountedPrice: "€10,00",
          isFree: false,
        },
      }),
    );
    expect(result?.discountPercent).toBe(50);
  });

  it("uses sale price when base price is invalid", () => {
    const result = normalizePsnProduct(
      product({
        price: {
          basePrice: "n/a",
          discountText: null,
          discountedPrice: "€8,00",
          isFree: false,
        },
      }),
    );
    expect(result?.originalPriceEur).toBe(8);
    expect(result?.discountPercent).toBe(0);
  });
});
