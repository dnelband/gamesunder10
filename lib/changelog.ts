import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface ChangelogSection {
  title: string;
  items: string[];
}

export interface ChangelogRelease {
  version: string;
  date: string | null;
  sections: ChangelogSection[];
}

/**
 * Parses Keep a Changelog and release-please markdown into structured releases.
 *
 * Supported headings:
 * - `## [1.0.0] — 2026-07-20`
 * - `## [1.0.1](https://…) (2026-07-21)`
 */
export function parseChangelogMarkdown(markdown: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let current: ChangelogRelease | null = null;
  let section: ChangelogSection | null = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const release = matchReleaseHeading(line);
    if (release) {
      if (current) {
        releases.push(current);
      }
      current = release;
      section = null;
      continue;
    }

    if (!current) {
      continue;
    }

    const sectionMatch = line.match(/^###\s+(.+)\s*$/);
    if (sectionMatch) {
      section = { title: sectionMatch[1].trim(), items: [] };
      current.sections.push(section);
      continue;
    }

    const itemMatch = line.match(/^[-*]\s+(.+)\s*$/);
    if (itemMatch && section) {
      section.items.push(cleanChangelogItem(itemMatch[1]));
    }
  }

  if (current) {
    releases.push(current);
  }

  return releases;
}

function matchReleaseHeading(line: string): ChangelogRelease | null {
  // release-please: ## [1.0.1](https://github.com/.../compare/...) (2026-07-21)
  const linked = line.match(
    /^##\s+\[([^\]]+)\]\([^)]+\)\s*\((\d{4}-\d{2}-\d{2})\)\s*$/,
  );
  if (linked) {
    return {
      version: linked[1],
      date: linked[2],
      sections: [],
    };
  }

  // Keep a Changelog: ## [1.0.0] — 2026-07-20
  const plain = line.match(
    /^##\s+\[([^\]]+)\]\s*(?:—|-|–)\s*(.+)\s*$/,
  );
  if (plain) {
    return {
      version: plain[1],
      date: plain[2].trim() || null,
      sections: [],
    };
  }

  return null;
}

/** Strip trailing PR/commit links release-please appends. */
function cleanChangelogItem(item: string): string {
  return item
    .replace(/\s*\(\[#[\d]+\]\([^)]+\)\)\s*$/g, "")
    .replace(/\s*\(\[[0-9a-f]{7,40}\]\([^)]+\)\)\s*$/gi, "")
    .trim();
}

export function loadChangelogReleases(): ChangelogRelease[] {
  const path = join(process.cwd(), "CHANGELOG.md");
  const markdown = readFileSync(path, "utf8");
  return parseChangelogMarkdown(markdown);
}
