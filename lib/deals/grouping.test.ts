import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildGroupKey,
  parseGroupKey,
  platformFamily,
} from "./grouping";

describe("platformFamily", () => {
  it("classifies PC platforms as pc", () => {
    assert.equal(platformFamily(["PC"]), "pc");
  });

  it("classifies console platforms as console", () => {
    assert.equal(platformFamily(["PS5"]), "console");
    assert.equal(platformFamily(["Xbox Series X|S", "PC"]), "console");
  });
});

describe("buildGroupKey / parseGroupKey", () => {
  it("round-trips steam keys for pc", () => {
    const key = buildGroupKey({
      platforms: ["PC"],
      steamAppId: "12345",
      normalizedTitle: "some game",
    });
    assert.equal(key, "pc~s~12345");
    assert.deepEqual(parseGroupKey(key), {
      family: "pc",
      steamAppId: "12345",
      normalizedTitle: null,
    });
  });

  it("round-trips steam keys for console", () => {
    const key = buildGroupKey({
      platforms: ["PS5"],
      steamAppId: "999",
      normalizedTitle: "ignored when steam present",
    });
    assert.equal(key, "console~s~999");
    assert.deepEqual(parseGroupKey(key), {
      family: "console",
      steamAppId: "999",
      normalizedTitle: null,
    });
  });

  it("round-trips title keys with base64url encoding", () => {
    const normalizedTitle = "echo of ada";
    const key = buildGroupKey({
      platforms: ["PC"],
      steamAppId: null,
      normalizedTitle,
    });
    assert.match(key, /^pc~t~/);
    assert.deepEqual(parseGroupKey(key), {
      family: "pc",
      steamAppId: null,
      normalizedTitle,
    });
  });

  it("returns null for invalid keys", () => {
    assert.equal(parseGroupKey(""), null);
    assert.equal(parseGroupKey("pc~s"), null);
    assert.equal(parseGroupKey("mobile~s~1"), null);
    assert.equal(parseGroupKey("pc~x~abc"), null);
    assert.equal(parseGroupKey("pc~t~"), null);
  });
});
