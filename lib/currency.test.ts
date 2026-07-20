import { afterEach, describe, expect, it, vi } from "vitest";

import { parseEurPrice, usdToEur } from "./currency";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("parseEurPrice", () => {
  it("parses euro amounts with comma decimals", () => {
    expect(parseEurPrice("€9,99")).toBe(9.99);
  });

  it("parses euro amounts with dot decimals", () => {
    expect(parseEurPrice("€9.99")).toBe(9.99);
  });

  it("parses plain numeric strings", () => {
    expect(parseEurPrice("9.99")).toBe(9.99);
  });
});

describe("usdToEur", () => {
  it("converts with the default rate when env is unset", () => {
    vi.stubEnv("USD_TO_EUR_RATE", undefined as unknown as string);
    delete process.env.USD_TO_EUR_RATE;
    expect(usdToEur(10)).toBe(9.2);
  });

  it("uses USD_TO_EUR_RATE when set", () => {
    vi.stubEnv("USD_TO_EUR_RATE", "1");
    expect(usdToEur(10)).toBe(10);
  });
});
