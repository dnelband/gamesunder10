import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canonicalizeWishlistMatchTitle,
  wishlistTitlesMatch,
} from "./deal-utils";

describe("canonicalizeWishlistMatchTitle", () => {
  it("strips deluxe edition suffix", () => {
    assert.equal(
      canonicalizeWishlistMatchTitle(
        "SYNDUALITY: Echo of Ada Deluxe Edition",
      ),
      "synduality echo of ada",
    );
  });

  it("strips ultimate edition suffix", () => {
    assert.equal(
      canonicalizeWishlistMatchTitle(
        "SYNDUALITY: Echo of Ada Ultimate Edition",
      ),
      "synduality echo of ada",
    );
  });

  it("leaves base title unchanged", () => {
    assert.equal(
      canonicalizeWishlistMatchTitle("SYNDUALITY: Echo of Ada"),
      "synduality echo of ada",
    );
  });

  it("does not strip unrelated trailing words", () => {
    assert.equal(
      canonicalizeWishlistMatchTitle("SYNDUALITY: Echo of Ada Fan Pack"),
      "synduality echo of ada fan pack",
    );
  });
});

describe("wishlistTitlesMatch", () => {
  it("matches base game to deluxe edition", () => {
    assert.equal(
      wishlistTitlesMatch(
        "SYNDUALITY: Echo of Ada",
        "SYNDUALITY: Echo of Ada Deluxe Edition",
      ),
      true,
    );
  });

  it("matches base game to ultimate edition", () => {
    assert.equal(
      wishlistTitlesMatch(
        "SYNDUALITY: Echo of Ada",
        "SYNDUALITY: Echo of Ada Ultimate Edition",
      ),
      true,
    );
  });

  it("does not match unrelated titles", () => {
    assert.equal(
      wishlistTitlesMatch("Hollow Knight", "Hollow Knight Silksong"),
      false,
    );
  });

  it("still matches exact titles", () => {
    assert.equal(
      wishlistTitlesMatch(
        "SYNDUALITY: Echo of Ada Deluxe Edition",
        "SYNDUALITY: Echo of Ada Deluxe Edition",
      ),
      true,
    );
  });
});
