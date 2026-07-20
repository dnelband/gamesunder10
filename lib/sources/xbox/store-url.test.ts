import { describe, expect, it } from "vitest";

import { buildXboxStoreUrl, titleToXboxSlug } from "./store-url";

describe("titleToXboxSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(titleToXboxSlug("Halo Infinite")).toBe("halo-infinite");
  });
});

describe("buildXboxStoreUrl", () => {
  it("builds locale + slug + product id URL", () => {
    expect(buildXboxStoreUrl("Halo Infinite", "9PP5G1F0C2B6")).toBe(
      "https://www.xbox.com/de-de/games/store/halo-infinite/9pp5g1f0c2b6",
    );
  });

  it("falls back when slug cannot be derived", () => {
    expect(buildXboxStoreUrl("!!!", "9PP5G1F0C2B6")).toBe(
      "https://www.xbox.com/de-de/games/store/9pp5g1f0c2b6",
    );
  });
});
