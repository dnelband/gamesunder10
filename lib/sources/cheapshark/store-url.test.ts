import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCheapsharkProductUrl,
  titleToEpicSlug,
  titleToGogSlug,
  titleToGmgSlug,
  titleToHyphenSlug,
} from "./store-url";

describe("titleToHyphenSlug", () => {
  it("lowercases and hyphenates", () => {
    assert.equal(titleToHyphenSlug("Hades II"), "hades-ii");
  });

  it("replaces punctuation with hyphens", () => {
    assert.equal(titleToHyphenSlug("Baldur's Gate 3"), "baldur-s-gate-3");
  });
});

describe("titleToEpicSlug", () => {
  it("uses double hyphen before edition segment", () => {
    assert.equal(
      titleToEpicSlug("Game Name Digital Deluxe Edition"),
      "game-name--digital-deluxe-edition",
    );
  });

  it("falls back to hyphen slug without edition", () => {
    assert.equal(titleToEpicSlug("Simple Title"), "simple-title");
  });
});

describe("titleToGogSlug", () => {
  it("uses underscores and drops internal hyphens", () => {
    assert.equal(titleToGogSlug("Middle-earth: Shadow"), "middleearth_shadow");
  });
});

describe("titleToGmgSlug", () => {
  it("treats underscores as word breaks", () => {
    assert.equal(titleToGmgSlug("Watch_Dogs"), "watch-dogs");
  });
});

describe("buildCheapsharkProductUrl", () => {
  it("builds Steam product URL from app id", () => {
    assert.deepEqual(
      buildCheapsharkProductUrl({
        storeId: "1",
        title: "Any",
        steamAppId: "570",
      }),
      {
        storeId: "1",
        kind: "product",
        url: "https://store.steampowered.com/app/570",
      },
    );
  });

  it("returns null for Steam without app id", () => {
    assert.equal(
      buildCheapsharkProductUrl({
        storeId: "1",
        title: "Any",
        steamAppId: null,
      }),
      null,
    );
  });

  it("builds Humble product URL from title slug", () => {
    assert.deepEqual(
      buildCheapsharkProductUrl({
        storeName: "Humble Store",
        title: "Hades II",
      }),
      {
        storeId: "11",
        kind: "product",
        url: "https://www.humblebundle.com/store/hades-ii",
      },
    );
  });

  it("returns null when store cannot be resolved", () => {
    assert.equal(
      buildCheapsharkProductUrl({
        title: "Hades II",
      }),
      null,
    );
  });
});
