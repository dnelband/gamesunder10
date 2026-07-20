export const DEAL_SOURCES = [
  "cheapshark",
  "itad",
  "psn",
  "xbox",
  "eshop",
] as const;

export type DealSource = (typeof DEAL_SOURCES)[number];
