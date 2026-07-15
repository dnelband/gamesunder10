const DEFAULT_MAX_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("Retry-After");
  if (retryAfter) {
    const seconds = Number.parseInt(retryAfter, 10);
    if (!Number.isNaN(seconds) && seconds > 0) {
      return seconds * 1_000;
    }
  }

  const backoff = INITIAL_BACKOFF_MS * 2 ** (attempt - 1);
  return Math.min(backoff, MAX_BACKOFF_MS);
}

export async function fetchCheapsharkWithRetry(
  url: string | URL,
  options?: { maxAttempts?: number; label?: string },
): Promise<Response> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const label = options?.label ?? String(url);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(url);

    if (response.ok) {
      return response;
    }

    if (!RETRYABLE_STATUS.has(response.status) || attempt === maxAttempts) {
      throw new Error(`CheapShark ${label} failed: ${response.status}`);
    }

    const waitMs = retryDelayMs(response, attempt);
    console.warn(
      `[cheapshark] ${label}: HTTP ${response.status}, retry ${attempt}/${maxAttempts} in ${waitMs}ms`,
    );
    await sleep(waitMs);
  }

  throw new Error(`CheapShark ${label} failed after ${maxAttempts} attempts`);
}

export async function delayBetweenRequests(ms: number): Promise<void> {
  if (ms > 0) {
    await sleep(ms);
  }
}
