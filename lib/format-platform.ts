const PLATFORM_ORDER = [
  "PS5",
  "PS4",
  "Xbox Series X|S",
  "Xbox One",
  "PC",
  "Xbox",
  "Switch",
] as const;

export function sortPlatforms(platforms: string[]): string[] {
  return [...platforms].sort((a, b) => {
    const indexA = PLATFORM_ORDER.indexOf(a as (typeof PLATFORM_ORDER)[number]);
    const indexB = PLATFORM_ORDER.indexOf(b as (typeof PLATFORM_ORDER)[number]);
    const rankA = indexA === -1 ? PLATFORM_ORDER.length : indexA;
    const rankB = indexB === -1 ? PLATFORM_ORDER.length : indexB;
    return rankA - rankB || a.localeCompare(b);
  });
}
