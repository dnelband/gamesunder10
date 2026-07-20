import { describe, expect, it } from "vitest";

import {
  formatRatingBadgeValue,
  formatRatingSourceLabel,
  getScoreBadgeClass,
} from "./format-rating";

describe("formatRatingBadgeValue", () => {
  it("adds a percent suffix for Steam scores", () => {
    expect(formatRatingBadgeValue(91.4, "steam")).toBe("91%");
  });

  it("shows a bare number for other sources", () => {
    expect(formatRatingBadgeValue(88.6, "metacritic")).toBe("89");
  });
});

describe("getScoreBadgeClass", () => {
  it("uses a neutral class for Steam", () => {
    expect(getScoreBadgeClass(95, "steam")).toBe("bg-surface-2 text-fg");
  });

  it("bands non-Steam scores", () => {
    expect(getScoreBadgeClass(80, "metacritic")).toBe("bg-cut text-bg");
    expect(getScoreBadgeClass(60, "igdb")).toBe("bg-price text-bg");
    expect(getScoreBadgeClass(40, "store")).toBe("bg-danger text-fg");
  });
});

describe("formatRatingSourceLabel", () => {
  it("labels known sources", () => {
    expect(formatRatingSourceLabel("steam")).toBe("Steam");
    expect(formatRatingSourceLabel("metacritic")).toBe("Metacritic");
    expect(formatRatingSourceLabel("igdb")).toBe("IGDB");
    expect(formatRatingSourceLabel("store")).toBe("Store");
  });

  it("falls back for unknown sources", () => {
    expect(
      formatRatingSourceLabel("other" as Parameters<
        typeof formatRatingSourceLabel
      >[0]),
    ).toBe("Rating");
  });
});
