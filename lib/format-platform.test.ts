import { describe, expect, it } from "vitest";

import { sortPlatforms } from "./format-platform";

describe("sortPlatforms", () => {
  it("orders known platforms by PLATFORM_ORDER", () => {
    expect(
      sortPlatforms(["PC", "PS5", "Xbox One", "Switch", "PS4"]),
    ).toEqual(["PS5", "PS4", "Xbox One", "PC", "Switch"]);
  });

  it("places unknown platforms after known ones, alphabetically", () => {
    expect(sortPlatforms(["PC", "Dreamcast", "Amiga"])).toEqual([
      "PC",
      "Amiga",
      "Dreamcast",
    ]);
  });
});
