import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getIgdbXboxExternalGameSource,
  getXboxLocale,
  getXboxMarket,
} from "./config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("xbox config defaults", () => {
  it("uses built-in defaults when env is unset", () => {
    delete process.env.XBOX_LOCALE;
    delete process.env.XBOX_MARKET;
    delete process.env.IGDB_XBOX_EXTERNAL_GAME_SOURCE;

    expect(getXboxLocale()).toBe("de-DE");
    expect(getXboxMarket()).toBe("DE");
    expect(getIgdbXboxExternalGameSource()).toBe(11);
  });

  it("honors env overrides", () => {
    vi.stubEnv("XBOX_LOCALE", "en-US");
    vi.stubEnv("XBOX_MARKET", "US");
    vi.stubEnv("IGDB_XBOX_EXTERNAL_GAME_SOURCE", "42");

    expect(getXboxLocale()).toBe("en-US");
    expect(getXboxMarket()).toBe("US");
    expect(getIgdbXboxExternalGameSource()).toBe(42);
  });
});
