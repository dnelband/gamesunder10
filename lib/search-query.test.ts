import { describe, expect, it } from "vitest";

import { effectiveSearchQuery } from "./search-query";

describe("effectiveSearchQuery", () => {
  it("returns empty for nullish or short input", () => {
    expect(effectiveSearchQuery(null)).toBe("");
    expect(effectiveSearchQuery(undefined)).toBe("");
    expect(effectiveSearchQuery("")).toBe("");
    expect(effectiveSearchQuery(" a ")).toBe("");
  });

  it("trims and keeps queries of length 2+", () => {
    expect(effectiveSearchQuery("  ab  ")).toBe("ab");
    expect(effectiveSearchQuery("hollow")).toBe("hollow");
  });
});
