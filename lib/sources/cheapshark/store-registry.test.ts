import { describe, expect, it } from "vitest";

import {
  cheapsharkStoreIdByName,
  linkBuilderStatusForStore,
} from "./store-registry";

describe("cheapsharkStoreIdByName", () => {
  it("resolves known store names case-insensitively", () => {
    expect(cheapsharkStoreIdByName("Steam")).toBe("1");
    expect(cheapsharkStoreIdByName("humble store")).toBe("11");
  });

  it("returns null for unknown stores", () => {
    expect(cheapsharkStoreIdByName("Totally Fake Store")).toBeNull();
  });
});

describe("linkBuilderStatusForStore", () => {
  it("labels console sources as product builders", () => {
    expect(linkBuilderStatusForStore({ source: "psn", storeName: "x" })).toEqual(
      {
        kind: "product",
        label: "product",
        detail: "PlayStation Store product id",
      },
    );
    expect(
      linkBuilderStatusForStore({ source: "xbox", storeName: "x" }),
    ).toMatchObject({ kind: "product", label: "product" });
  });

  it("reports product / search / omit for CheapShark stores", () => {
    expect(
      linkBuilderStatusForStore({ source: "cheapshark", storeName: "Steam" }),
    ).toMatchObject({ kind: "product", label: "product" });

    expect(
      linkBuilderStatusForStore({
        source: "cheapshark",
        storeName: "WinGameStore",
      }),
    ).toMatchObject({ kind: "search", label: "search" });

    expect(
      linkBuilderStatusForStore({
        source: "cheapshark",
        storeName: "Uplay",
      }),
    ).toMatchObject({ kind: "search", label: "search" });

    expect(
      linkBuilderStatusForStore({
        source: "cheapshark",
        storeName: "Unknown Mart",
      }),
    ).toMatchObject({ kind: "omit", label: "omit" });
  });

  it("omits unknown sources", () => {
    expect(
      linkBuilderStatusForStore({ source: "mystery", storeName: "X" }),
    ).toMatchObject({ kind: "omit", label: "omit" });
  });
});
