/**
 * Storefront art from ingestion — many CDNs, no stable allowlist.
 * Native img avoids next/image remotePatterns maintenance per source.
 *
 * Default fill fit is `width`: always span the box width. Landscape
 * letterboxes top/bottom; taller art may clip vertically (overflow on parent).
 */
import { clsx } from "clsx";

interface DealImageProps {
  src: string;
  alt?: string;
  fill?: boolean;
  priority?: boolean;
  /**
   * `width` — fill width, letterbox or clip height (default).
   * `contain` — full art, may letterbox sides.
   * `cover` — fill box, may crop any side.
   */
  fit?: "width" | "contain" | "cover";
  className?: string;
}

function fillClasses(fit: NonNullable<DealImageProps["fit"]>): string {
  switch (fit) {
    case "contain":
      return "absolute inset-0 h-full w-full object-contain";
    case "cover":
      return "absolute inset-0 h-full w-full object-cover";
    case "width":
    default:
      // Width-locked; vertically centered. Parent must overflow-hidden.
      return "absolute top-1/2 left-0 w-full -translate-y-1/2";
  }
}

export function DealImage({
  src,
  alt = "",
  fill = false,
  priority = false,
  fit = "width",
  className,
}: DealImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary storefront CDNs
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={clsx(fill && fillClasses(fit), className)}
    />
  );
}
