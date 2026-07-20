import { describe, expect, it } from "vitest";

import { parseChangelogMarkdown } from "./changelog";

const KEEP_A_CHANGELOG = `# Changelog

## [1.0.0] — 2026-07-20

### Added

- Deals listing
- Wishlist

### Fixed

- Something small

## [0.9.0] - 2026-01-01

### Added

- Beta

[1.0.0]: https://example.com/v1
`;

const RELEASE_PLEASE = `# Changelog

## [1.0.1](https://github.com/dnelband/gamesunder10/compare/v1.0.0...v1.0.1) (2026-07-21)


### Features

* show version in footer ([#12](https://github.com/dnelband/gamesunder10/issues/12))


### Bug Fixes

* modal close cursor ([abc1234](https://github.com/dnelband/gamesunder10/commit/abc1234))
`;

describe("parseChangelogMarkdown", () => {
  it("parses Keep a Changelog releases", () => {
    const releases = parseChangelogMarkdown(KEEP_A_CHANGELOG);
    expect(releases).toHaveLength(2);
    expect(releases[0]).toEqual({
      version: "1.0.0",
      date: "2026-07-20",
      sections: [
        { title: "Added", items: ["Deals listing", "Wishlist"] },
        { title: "Fixed", items: ["Something small"] },
      ],
    });
    expect(releases[1].version).toBe("0.9.0");
  });

  it("parses release-please headings and strips PR/commit suffixes", () => {
    const releases = parseChangelogMarkdown(RELEASE_PLEASE);
    expect(releases).toHaveLength(1);
    expect(releases[0]).toEqual({
      version: "1.0.1",
      date: "2026-07-21",
      sections: [
        { title: "Features", items: ["show version in footer"] },
        { title: "Bug Fixes", items: ["modal close cursor"] },
      ],
    });
  });

  it("returns an empty list when there are no release headings", () => {
    expect(parseChangelogMarkdown("# Changelog\n\nIntro only.\n")).toEqual([]);
  });
});
