export function releaseLabel(releaseDate: string | null): string {
  if (!releaseDate) {
    return "Release TBA";
  }
  const today = new Date().toISOString().slice(0, 10);
  if (releaseDate > today) {
    return `Unreleased · ${releaseDate}`;
  }
  return releaseDate.slice(0, 4);
}

export function WishlistSuggestionTitleRow({
  title,
  releaseDate,
  href,
}: {
  title: string;
  releaseDate: string | null;
  href: string;
}) {
  return (
    <p className="truncate text-base">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-fg underline-offset-2 hover:text-accent hover:underline"
      >
        {title}
      </a>
      <span className="text-xs text-muted"> · {releaseLabel(releaseDate)}</span>
    </p>
  );
}

export function GenreTags({ genres }: { genres: string[] }) {
  if (genres.length === 0) {
    return null;
  }

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {genres.slice(0, 3).map((genre) => (
        <span
          key={genre}
          className="rounded-md border border-stroke bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted"
        >
          {genre}
        </span>
      ))}
    </div>
  );
}
