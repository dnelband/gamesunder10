/** PlayStation listing platforms (filter pills + grouping). */
export const PLAYSTATION_PLATFORMS = ["PS5", "PS4"] as const;

/** Xbox listing platforms — API does not split Series S vs X. */
export const XBOX_PLATFORMS = ["Xbox Series X|S", "Xbox One"] as const;

export const CONSOLE_PLATFORMS = [
  ...PLAYSTATION_PLATFORMS,
  ...XBOX_PLATFORMS,
] as const;

export const FILTER_PLATFORMS = [
  ...PLAYSTATION_PLATFORMS,
  "PC",
  ...XBOX_PLATFORMS,
] as const;

export type FilterPlatform = (typeof FILTER_PLATFORMS)[number];
