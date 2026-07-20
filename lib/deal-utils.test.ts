import { describe, expect, it } from "vitest";

import { buildDealId, normalizeTitle } from "./deal-utils";

describe("normalizeTitle", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeTitle("  Hollow   Knight  ")).toBe("hollow knight");
  });

  it("strips punctuation while keeping letters and numbers", () => {
    expect(normalizeTitle("Baldur's Gate 3: Deluxe!")).toBe(
      "baldurs gate 3 deluxe",
    );
  });
});

describe("buildDealId", () => {
  it("returns a stable 32-char hex id", () => {
    const id = buildDealId("cheapshark", "abc123");
    expect(id).toMatch(/^[a-f0-9]{32}$/);
    expect(buildDealId("cheapshark", "abc123")).toBe(id);
  });

  it("differs across sources for the same sourceDealId", () => {
    expect(buildDealId("cheapshark", "same")).not.toBe(
      buildDealId("psn", "same"),
    );
  });
});
