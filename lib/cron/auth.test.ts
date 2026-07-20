import { afterEach, describe, expect, it, vi } from "vitest";

import { isAuthorizedCronRequest } from "./auth";

afterEach(() => {
  vi.unstubAllEnvs();
});

function requestWithAuth(authorization: string | null): Request {
  const headers = new Headers();
  if (authorization) {
    headers.set("authorization", authorization);
  }
  return new Request("https://example.com/api/cron/cheapshark", { headers });
}

describe("isAuthorizedCronRequest", () => {
  it("allows matching Bearer secret", () => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    expect(
      isAuthorizedCronRequest(requestWithAuth("Bearer test-secret")),
    ).toBe(true);
  });

  it("rejects wrong or missing Bearer when secret is set", () => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    expect(
      isAuthorizedCronRequest(requestWithAuth("Bearer wrong")),
    ).toBe(false);
    expect(isAuthorizedCronRequest(requestWithAuth(null))).toBe(false);
  });

  it("allows missing secret only in development", () => {
    vi.stubEnv("CRON_SECRET", undefined as unknown as string);
    delete process.env.CRON_SECRET;
    vi.stubEnv("NODE_ENV", "development");
    expect(isAuthorizedCronRequest(requestWithAuth(null))).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    expect(isAuthorizedCronRequest(requestWithAuth(null))).toBe(false);
  });
});
