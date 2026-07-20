import { describe, expect, it } from "vitest";

import { resolveOfferUrl } from "./resolve-offer-url";

describe("resolveOfferUrl — source routing", () => {
  it("routes CheapShark offers through the CS builder", () => {
    expect(
      resolveOfferUrl({
        source: "cheapshark",
        storeName: "Steam",
        title: "Any",
        steamAppId: "570",
        url: "https://ignored.example",
      }),
    ).toBe("https://store.steampowered.com/app/570");
  });

  it("rebuilds Xbox URLs from product id", () => {
    expect(
      resolveOfferUrl({
        source: "xbox",
        storeName: "Xbox Store",
        title: "Halo Infinite",
        steamAppId: null,
        externalStoreUid: "9PP5G1F0C2B6",
        url: "https://stale.example/old-path",
      }),
    ).toBe(
      "https://www.xbox.com/de-de/games/store/halo-infinite/9pp5g1f0c2b6",
    );
  });

  it("uses stored URL for PSN listings", () => {
    const url =
      "https://store.playstation.com/de-de/product/UP0001-CUSA12345_00-GAME";
    expect(
      resolveOfferUrl({
        source: "psn",
        storeName: "PlayStation Store",
        title: "Game",
        steamAppId: null,
        url,
      }),
    ).toBe(url);
  });
});

describe("resolveOfferUrl — Xbox fallbacks", () => {
  it("rebuilds from a stored /games/store/ path when uid is missing", () => {
    expect(
      resolveOfferUrl({
        source: "xbox",
        storeName: "Xbox Store",
        title: "Halo Infinite",
        steamAppId: null,
        externalStoreUid: null,
        url: "https://www.xbox.com/de-de/games/store/halo-infinite/9PP5G1F0C2B6",
      }),
    ).toBe(
      "https://www.xbox.com/de-de/games/store/halo-infinite/9pp5g1f0c2b6",
    );
  });

  it("falls back to stored URL when product id cannot be recovered", () => {
    expect(
      resolveOfferUrl({
        source: "xbox",
        storeName: "Xbox Store",
        title: "Halo Infinite",
        steamAppId: null,
        url: "not-a-url",
      }),
    ).toBe("not-a-url");
  });

  it("returns null when stored URL is also blank", () => {
    expect(
      resolveOfferUrl({
        source: "xbox",
        storeName: "Xbox Store",
        title: "Halo Infinite",
        steamAppId: null,
        url: "",
      }),
    ).toBeNull();
  });

  it("returns null when stored URL is blank for non-builder sources", () => {
    expect(
      resolveOfferUrl({
        source: "psn",
        storeName: "PlayStation Store",
        title: "Game",
        steamAppId: null,
        url: "  ",
      }),
    ).toBeNull();
  });
});
