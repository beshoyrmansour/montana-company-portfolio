'use client';

import dynamic from 'next/dynamic';
import type { TradeAtlasProps } from './TradeAtlas';

/**
 * Lazy wrapper for TradeAtlas.
 *
 * The map imports world-paths.json (~1.2 MB of country SVG geometry). Loading
 * it via next/dynamic with `ssr: false` splits it into a deferred async chunk,
 * so it stays out of the route's First Load JS and is fetched on the client
 * after the page paints. A min-height placeholder reserves the space to avoid
 * layout shift while the chunk loads.
 */
const TradeAtlas = dynamic(() => import('./TradeAtlas').then((m) => m.TradeAtlas), {
  ssr: false,
  loading: () => (
    <div className="trade-atlas trade-atlas-loading" style={{ minHeight: 420 }} aria-hidden="true" />
  ),
});

export function TradeAtlasLazy(props: TradeAtlasProps) {
  return <TradeAtlas {...props} />;
}
