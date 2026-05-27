/**
 * Static map — renders a single map image (no JS, no tiles loaded).
 *
 * Providers:
 *  - 'static' (default): inline SVG fallback — zero external requests, zero
 *    Lighthouse impact, zero API key. Shows a pin on a simple branded backdrop
 *    with the address text. Sufficient for a Contact page.
 *  - 'maptiler': real map via MapTiler's /staticmap endpoint (needs NEXT_PUBLIC_MAPTILER_KEY).
 *  - 'google': Google Maps Static API (needs NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
 *
 * The actual provider is chosen at build time via NEXT_PUBLIC_MAP_PROVIDER.
 */

interface StaticMapProps {
  lat: number;
  lng: number;
  label?: string;
  zoom?: number;
  width?: number;
  height?: number;
  alt: string;
}

export function StaticMap({
  lat,
  lng,
  label,
  zoom = 14,
  width = 800,
  height = 480,
  alt,
}: StaticMapProps) {
  const provider = process.env.NEXT_PUBLIC_MAP_PROVIDER ?? 'static';

  // MapTiler /staticmap endpoint
  if (provider === 'maptiler') {
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (key) {
      const marker = `pin-l+147239(${lng},${lat})`;
      const url = `https://api.maptiler.com/maps/streets/static/${marker}/${lng},${lat},${zoom}/${width}x${height}.png?key=${key}`;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="rounded-lg"
        />
      );
    }
  }

  // Google Maps Static API
  if (provider === 'google') {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (key) {
      const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:0x147239|${lat},${lng}&key=${key}`;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="rounded-lg"
        />
      );
    }
  }

  // Default — inline SVG with no external request.
  // Visually communicates "this is a location" without claiming to be a real map.
  return (
    <div
      role="img"
      aria-label={alt}
      className="relative overflow-hidden rounded-lg bg-brand-cream"
      style={{ aspectRatio: `${width}/${height}` }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden
      >
        {/* Grid background */}
        <defs>
          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--color-brand-primary)"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="var(--color-brand-cream)" />
        <rect width={width} height={height} fill="url(#map-grid)" />

        {/* Center pin */}
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          <circle
            r="40"
            fill="var(--color-brand-primary)"
            fillOpacity="0.18"
          />
          <circle r="14" fill="var(--color-brand-secondary)" />
          <circle r="6" fill="#FFFFFF" />
        </g>

        {/* Label */}
        {label && (
          <text
            x={width / 2}
            y={height / 2 + 70}
            textAnchor="middle"
            fontSize="18"
            fontFamily="system-ui, sans-serif"
            fontWeight="600"
            fill="var(--color-text)"
          >
            {label}
          </text>
        )}
        <text
          x={width / 2}
          y={height - 24}
          textAnchor="middle"
          fontSize="12"
          fontFamily="system-ui, sans-serif"
          fill="var(--color-text-muted)"
          opacity="0.7"
        >
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </text>
      </svg>
    </div>
  );
}
