import { describe, expect, it } from "vitest";

import { deriveSourceStatus } from "./source-health";

describe("deriveSourceStatus", () => {
  it("returns ok on success regardless of prior failures", () => {
    expect(deriveSourceStatus(5, true)).toBe("ok");
  });

  it("returns degraded for 1–2 consecutive failures", () => {
    expect(deriveSourceStatus(1, false)).toBe("degraded");
    expect(deriveSourceStatus(2, false)).toBe("degraded");
  });

  it("returns broken at 3+ consecutive failures", () => {
    expect(deriveSourceStatus(3, false)).toBe("broken");
    expect(deriveSourceStatus(10, false)).toBe("broken");
  });

  it("returns ok when not succeeding and failures are zero", () => {
    expect(deriveSourceStatus(0, false)).toBe("ok");
  });
});
