'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Product image gallery — a main viewport plus a thumbnail strip.
 *
 * Handles two kinds of source images in one frame:
 *   - transparent retail packshots (.png / "-pack") → object-contain on a
 *     padded muted surface, so the pack floats cleanly
 *   - photographic shots (.jpg lifestyle/stock) → object-cover, edge to edge
 */
function isPackshot(src: string): boolean {
  return src.endsWith('.png') || src.includes('-pack.');
}

/** Authentic quality-team sample photos live under this path prefix. */
function isRealSample(src: string): boolean {
  return src.includes('/images/products/real/');
}

export function ProductGallery({
  images,
  alt,
  sampleLabel,
}: {
  images: string[];
  alt: string;
  /** Label shown on photos that are authentic product samples (vs. stock imagery). */
  sampleLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  if (!main) return null;
  const mainIsPack = isPackshot(main);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-muted relative aspect-square overflow-hidden rounded-2xl shadow-sm">
        <Image
          key={main}
          src={main}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className={mainIsPack ? 'object-contain p-8' : 'object-cover'}
        />
        {sampleLabel && isRealSample(main) && (
          <span className="bg-brand-primary/90 absolute start-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
            {sampleLabel}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={`bg-surface-muted relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? 'border-brand-primary' : 'hover:border-border border-transparent'
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="120px"
                className={isPackshot(src) ? 'object-contain p-2' : 'object-cover'}
              />
              {sampleLabel && isRealSample(src) && (
                <span
                  className="bg-brand-primary absolute end-1 top-1 h-2 w-2 rounded-full ring-1 ring-white"
                  title={sampleLabel}
                  aria-hidden
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
