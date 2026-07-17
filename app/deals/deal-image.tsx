/**
 * Storefront art from ingestion — many CDNs, no stable allowlist.
 * Native img avoids next/image remotePatterns maintenance per source.
 */
interface DealImageProps {
  src: string;
  alt?: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
}

export function DealImage({
  src,
  alt = "",
  fill = false,
  priority = false,
  className = "",
}: DealImageProps) {
  const classes = fill
    ? `absolute inset-0 h-full w-full object-cover ${className}`.trim()
    : className;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary storefront CDNs
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={classes}
    />
  );
}
