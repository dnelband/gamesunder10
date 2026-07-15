const DEFAULT_USD_TO_EUR = 0.92;

export function usdToEur(amountUsd: number): number {
  const rate = Number(process.env.USD_TO_EUR_RATE ?? DEFAULT_USD_TO_EUR);
  return Math.round(amountUsd * rate * 100) / 100;
}

export function parseUsdPrice(value: string): number {
  return Number.parseFloat(value);
}

/** Parses PlayStation Store prices like `€9,99` or `€9.99`. */
export function parseEurPrice(value: string): number {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(",", ".");
  return Number.parseFloat(normalized);
}
