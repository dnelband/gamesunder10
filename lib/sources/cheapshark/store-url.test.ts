import { describe, expect, it } from "vitest";

import {
  buildCheapsharkOfferUrl,
  buildCheapsharkProductUrl,
  buildCheapsharkSearchUrl,
  titleToEpicSlug,
  titleToGogSlug,
  titleToGmgSlug,
  titleToHyphenSlug,
} from "./store-url";

describe("titleToHyphenSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(titleToHyphenSlug("Hades II")).toBe("hades-ii");
  });

  it("replaces punctuation with hyphens", () => {
    expect(titleToHyphenSlug("Baldur's Gate 3")).toBe("baldur-s-gate-3");
  });
});

describe("titleToEpicSlug", () => {
  it("uses double hyphen before edition segment", () => {
    expect(titleToEpicSlug("Game Name Digital Deluxe Edition")).toBe(
      "game-name--digital-deluxe-edition",
    );
  });

  it("falls back to hyphen slug without edition", () => {
    expect(titleToEpicSlug("Simple Title")).toBe("simple-title");
  });
});

describe("titleToGogSlug", () => {
  it("uses underscores and drops internal hyphens", () => {
    expect(titleToGogSlug("Middle-earth: Shadow")).toBe("middleearth_shadow");
  });
});

describe("titleToGmgSlug", () => {
  it("treats underscores as word breaks", () => {
    expect(titleToGmgSlug("Watch_Dogs")).toBe("watch-dogs");
  });
});

describe("buildCheapsharkProductUrl", () => {
  it("builds Steam product URL from app id", () => {
    expect(
      buildCheapsharkProductUrl({
        storeId: "1",
        title: "Any",
        steamAppId: "570",
      }),
    ).toEqual({
      storeId: "1",
      kind: "product",
      url: "https://store.steampowered.com/app/570",
    });
  });

  it("returns null for Steam without app id", () => {
    expect(
      buildCheapsharkProductUrl({
        storeId: "1",
        title: "Any",
        steamAppId: null,
      }),
    ).toBeNull();
  });

  it("builds Humble product URL from title slug", () => {
    expect(
      buildCheapsharkProductUrl({
        storeName: "Humble Store",
        title: "Hades II",
      }),
    ).toEqual({
      storeId: "11",
      kind: "product",
      url: "https://www.humblebundle.com/store/hades-ii",
    });
  });

  it("returns null when store cannot be resolved", () => {
    expect(
      buildCheapsharkProductUrl({
        title: "Hades II",
      }),
    ).toBeNull();
  });
});

describe("buildCheapsharkSearchUrl", () => {
  it("builds a Steam search URL", () => {
    expect(
      buildCheapsharkSearchUrl({
        storeId: "1",
        title: "Hades II",
      }),
    ).toEqual({
      storeId: "1",
      kind: "search",
      url: "https://store.steampowered.com/search/?term=Hades%20II",
    });
  });
});

describe("buildCheapsharkOfferUrl", () => {
  it("prefers product URL when available", () => {
    expect(
      buildCheapsharkOfferUrl({
        storeId: "1",
        title: "Any",
        steamAppId: "570",
      }),
    ).toEqual({
      storeId: "1",
      kind: "product",
      url: "https://store.steampowered.com/app/570",
    });
  });

  it("falls back to search when product cannot be built", () => {
    expect(
      buildCheapsharkOfferUrl({
        storeId: "1",
        title: "Mystery Game",
        steamAppId: null,
      }),
    ).toEqual({
      storeId: "1",
      kind: "search",
      url: "https://store.steampowered.com/search/?term=Mystery%20Game",
    });
  });
});

describe("product URL builders for title-slug stores", () => {
  it("builds GamersGate, GMG, GOG, Fanatical, GameBillet, and Epic product URLs", () => {
    expect(
      buildCheapsharkProductUrl({ storeId: "2", title: "Hades II" }),
    ).toMatchObject({
      kind: "product",
      url: "https://www.gamersgate.com/product/hades-ii/",
    });
    expect(
      buildCheapsharkProductUrl({ storeId: "3", title: "Watch_Dogs" }),
    ).toMatchObject({
      kind: "product",
      url: "https://www.greenmangaming.com/games/watch-dogs/",
    });
    expect(
      buildCheapsharkProductUrl({ storeId: "7", title: "Middle-earth: Shadow" }),
    ).toMatchObject({
      kind: "product",
      url: "https://www.gog.com/en/game/middleearth_shadow",
    });
    expect(
      buildCheapsharkProductUrl({ storeId: "15", title: "Hades II" }),
    ).toMatchObject({
      kind: "product",
      url: "https://www.fanatical.com/en/game/hades-ii",
    });
    expect(
      buildCheapsharkProductUrl({ storeId: "23", title: "Hades II" }),
    ).toMatchObject({
      kind: "product",
      url: "https://www.gamebillet.com/hades-ii",
    });
    expect(
      buildCheapsharkProductUrl({
        storeId: "25",
        title: "Game Name Digital Deluxe Edition",
      }),
    ).toMatchObject({
      kind: "product",
      url: "https://store.epicgames.com/p/game-name--digital-deluxe-edition?lang=de",
    });
  });
});

describe("search URL builders for search-only stores", () => {
  it("builds search URLs for Ubisoft, WinGameStore, Gamesplanet, IndieGala", () => {
    expect(
      buildCheapsharkSearchUrl({ storeId: "13", title: "Far Cry" }),
    ).toMatchObject({
      kind: "search",
      url: "https://store.ubisoft.com/de/search?q=Far%20Cry",
    });
    expect(
      buildCheapsharkSearchUrl({ storeId: "21", title: "Indie Game" }),
    ).toMatchObject({
      kind: "search",
      url: "https://www.wingamestore.com/search/?Search=Indie%20Game",
    });
    expect(
      buildCheapsharkSearchUrl({ storeId: "27", title: "City" }),
    ).toMatchObject({
      kind: "search",
      url: "https://www.gamesplanet.com/search?query=City",
    });
    expect(
      buildCheapsharkSearchUrl({ storeId: "30", title: "Bundle" }),
    ).toMatchObject({
      kind: "search",
      url: "https://www.indiegala.com/store/search?q=Bundle",
    });
  });

  it("returns null when the store has no search builder", () => {
    expect(
      buildCheapsharkSearchUrl({ storeId: "999", title: "Anything" }),
    ).toBeNull();
  });
});
