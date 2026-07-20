import { describe, expect, it } from "vitest";

import { buildPsnStoreUrl } from "./store-url";

describe("buildPsnStoreUrl", () => {
  it("builds the product path for the configured store locale", () => {
    expect(buildPsnStoreUrl("UP0001-CUSA12345_00-GAME000000000000")).toBe(
      "https://store.playstation.com/de-de/product/UP0001-CUSA12345_00-GAME000000000000",
    );
  });
});
