import { describe, expect, it } from "vitest";

import {
  canonicalizeWishlistMatchTitle,
  wishlistTitlesMatch,
} from "./deal-utils";

describe("canonicalizeWishlistMatchTitle", () => {
  it("strips deluxe edition suffix", () => {
    expect(
      canonicalizeWishlistMatchTitle(
        "SYNDUALITY: Echo of Ada Deluxe Edition",
      ),
    ).toBe("synduality echo of ada");
  });

  it("strips ultimate edition suffix", () => {
    expect(
      canonicalizeWishlistMatchTitle(
        "SYNDUALITY: Echo of Ada Ultimate Edition",
      ),
    ).toBe("synduality echo of ada");
  });

  it("leaves base title unchanged", () => {
    expect(canonicalizeWishlistMatchTitle("SYNDUALITY: Echo of Ada")).toBe(
      "synduality echo of ada",
    );
  });

  it("does not strip unrelated trailing words", () => {
    expect(
      canonicalizeWishlistMatchTitle("SYNDUALITY: Echo of Ada Fan Pack"),
    ).toBe("synduality echo of ada fan pack");
  });
});

describe("wishlistTitlesMatch", () => {
  it("matches base game to deluxe edition", () => {
    expect(
      wishlistTitlesMatch(
        "SYNDUALITY: Echo of Ada",
        "SYNDUALITY: Echo of Ada Deluxe Edition",
      ),
    ).toBe(true);
  });

  it("matches base game to ultimate edition", () => {
    expect(
      wishlistTitlesMatch(
        "SYNDUALITY: Echo of Ada",
        "SYNDUALITY: Echo of Ada Ultimate Edition",
      ),
    ).toBe(true);
  });

  it("does not match unrelated titles", () => {
    expect(
      wishlistTitlesMatch("Hollow Knight", "Hollow Knight Silksong"),
    ).toBe(false);
  });

  it("still matches exact titles", () => {
    expect(
      wishlistTitlesMatch(
        "SYNDUALITY: Echo of Ada Deluxe Edition",
        "SYNDUALITY: Echo of Ada Deluxe Edition",
      ),
    ).toBe(true);
  });
});
