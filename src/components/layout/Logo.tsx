/**
 * Master logo — actual PNG from /public/images/logo/montana-logo.png
 * Aspect ratio: 1626 × 830  ≈  1.96 : 1
 *
 * Sized via the `className` prop (height controls the layout; width is auto).
 * Rendered as <img> (not next/image) because static export disables runtime
 * optimization and we already ship the PNG at print-grade resolution.
 */
interface LogoProps {
  className?: string;
  /** Forces a lighter rendering on dark surfaces (footer). Defaults to false. */
  inverse?: boolean;
  /** Accessible name. Defaults to "Montana". */
  alt?: string;
  /** When `true`, marks the image as decorative (use when wrapped in a labeled link). */
  decorative?: boolean;
}

export function Logo({ className, inverse, alt = 'Montana', decorative }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo/montana-logo.png"
      alt={decorative ? '' : alt}
      width={1626}
      height={830}
      className={className}
      decoding="async"
      fetchPriority="high"
      style={
        inverse
          ? {
              // On dark backgrounds, the red+green logo can lose contrast.
              // Wrapping the logo in a tight white pill restores legibility
              // without distorting the brand mark itself.
              background: 'rgba(255, 255, 255, 0.92)',
              padding: '0.5rem 0.75rem',
              borderRadius: '999px',
            }
          : undefined
      }
    />
  );
}
