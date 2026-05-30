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

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
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
                i === active ? 'border-brand-primary' : 'border-transparent hover:border-border'
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="120px"
                className={isPackshot(src) ? 'object-contain p-2' : 'object-cover'}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
