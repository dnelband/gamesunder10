import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getPsnDealsCategoryId,
  getPsnGraphqlHash,
  getPsnLocale,
  getPsnRegion,
  getPsnStorePath,
  getIgdbPsnExternalGameSource,
  DEFAULT_PSN_DEALS_CATEGORY_ID,
  DEFAULT_PSN_GRAPHQL_HASH,
} from "./config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("psn config defaults", () => {
  it("uses built-in defaults when env is unset", () => {
    delete process.env.PSN_LOCALE;
    delete process.env.PSN_STORE_PATH;
    delete process.env.PSN_REGION;
    delete process.env.PSN_DEALS_CATEGORY_ID;
    delete process.env.PSN_GRAPHQL_HASH;
    delete process.env.IGDB_PSN_EXTERNAL_GAME_SOURCE;

    expect(getPsnLocale()).toBe("de-DE");
    expect(getPsnStorePath()).toBe("de-de");
    expect(getPsnRegion()).toBe("DE");
    expect(getPsnDealsCategoryId()).toBe(DEFAULT_PSN_DEALS_CATEGORY_ID);
    expect(getPsnGraphqlHash()).toBe(DEFAULT_PSN_GRAPHQL_HASH);
    expect(getIgdbPsnExternalGameSource()).toBe(36);
  });

  it("honors env overrides", () => {
    vi.stubEnv("PSN_LOCALE", "en-GB");
    vi.stubEnv("PSN_STORE_PATH", "en-gb");
    vi.stubEnv("PSN_REGION", "GB");
    vi.stubEnv("PSN_DEALS_CATEGORY_ID", "cat-1");
    vi.stubEnv("PSN_GRAPHQL_HASH", "hash-1");
    vi.stubEnv("IGDB_PSN_EXTERNAL_GAME_SOURCE", "99");

    expect(getPsnLocale()).toBe("en-GB");
    expect(getPsnStorePath()).toBe("en-gb");
    expect(getPsnRegion()).toBe("GB");
    expect(getPsnDealsCategoryId()).toBe("cat-1");
    expect(getPsnGraphqlHash()).toBe("hash-1");
    expect(getIgdbPsnExternalGameSource()).toBe(99);
  });

  it("derives region from locale when PSN_REGION is unset", () => {
    delete process.env.PSN_REGION;
    vi.stubEnv("PSN_LOCALE", "fr-FR");
    expect(getPsnRegion()).toBe("FR");
  });
});
