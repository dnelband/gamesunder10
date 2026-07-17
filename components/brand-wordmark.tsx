interface BrandWordmarkProps {
  /** `lg` = hero (tagline). `sm` = compact nav/footer (no tagline). */
  size?: "sm" | "lg";
  className?: string;
}

export function BrandWordmark({ size = "lg", className = "" }: BrandWordmarkProps) {
  const isHero = size === "lg";

  return (
    <div className={className}>
      <p
        className={
          isHero
            ? "font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl"
            : "font-display text-lg font-bold tracking-tight text-fg"
        }
      >
        Broke <span className="text-accent">Gamer</span>
      </p>
      {isHero ? (
        <p className="mt-1.5 text-base text-muted sm:text-lg">
          Best for the least.
        </p>
      ) : null}
    </div>
  );
}
