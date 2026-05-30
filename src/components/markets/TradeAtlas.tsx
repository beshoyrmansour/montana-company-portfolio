'use client';

import { useMemo, useState } from 'react';
import worldPathsData from '../../../public/images/maps/world-paths.json';
import { COUNTRY_META, EGYPT_COORDS, regionColor } from '@/lib/markets-meta';
import { pick, type Locale } from '@/lib/i18n';

/**
 * TradeAtlas — interactive world map of Montana's 30-country export network.
 *
 * Renders the inline world.svg paths (250 countries) and overlays:
 *   - animated dashed trade routes from Kalioub (Egypt) to each destination
 *   - pulsing Egypt hub marker with brand-green halo
 *   - clickable destination markers with hover tooltip (flag · name · port)
 *   - region filter pills below the map
 *
 * Client component because of the hover/click state. The full world.svg
 * paths (~1.2MB raw) are imported as JSON at build time, so this hydrates
 * once and stays interactive without re-fetching.
 */

interface WorldPath {
  id: string; // ISO-2 country code
  d: string;
}
const WORLD_PATHS = worldPathsData as WorldPath[];

interface Region {
  id: string;
  name: { en: string; ar?: string; fr?: string };
  countries: Array<{ iso: string; name: { en: string; ar?: string; fr?: string } }>;
}

export interface TradeAtlasProps {
  regions: Region[];
  locale: Locale;
  labels: {
    allMarkets: string;
    hoverHint: string;
    egyptLabel: string;
    portLabel: string; // "Port" / "ميناء" / "Port"
  };
  /** Accepted for backwards compatibility — RTL flips are CSS-driven via
   *  `:root[dir='rtl']` selectors in globals.css, not via this prop. */
  dir?: 'ltr' | 'rtl';
}

export function TradeAtlas({ regions, locale, labels }: TradeAtlasProps) {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);

  // Build lookup: ISO → region (for highlighting country paths)
  const isoToRegion = useMemo(() => {
    const map: Record<string, Region> = {};
    regions.forEach((r) => {
      r.countries.forEach((c) => {
        map[c.iso] = r;
      });
    });
    return map;
  }, [regions]);

  // Build list of routes from Egypt to each non-hub destination
  const routes = useMemo(() => {
    const list: {
      iso: string;
      name: string;
      port: string;
      flag: string;
      color: string;
      regionId: string;
      dest: [number, number];
    }[] = [];
    regions.forEach((region) => {
      region.countries.forEach((c) => {
        const meta = COUNTRY_META[c.iso];
        if (!meta?.coords || meta.hub) return;
        list.push({
          iso: c.iso,
          name: pick(c.name, locale) ?? c.iso,
          port: meta.port,
          flag: meta.flag,
          color: regionColor(region.id),
          regionId: region.id,
          dest: meta.coords,
        });
      });
    });
    return list;
  }, [regions, locale]);

  const totalCountries = useMemo(
    () => regions.reduce((sum, r) => sum + r.countries.length, 0),
    [regions],
  );

  const isDimmed = (regionId: string) => activeRegion !== null && activeRegion !== regionId;

  return (
    <div className="trade-atlas">
      <svg
        viewBox="0 0 1009.6727 665.96301"
        className="trade-atlas-svg"
        aria-label="World map of Montana export markets"
      >
        <defs>
          <radialGradient id="hub-pulse">
            <stop offset="0%" stopColor="#147239" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#147239" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Country paths from world.svg — coloured per region, dimmed if filtered out */}
        <g>
          {WORLD_PATHS.map((p) => {
            const region = isoToRegion[p.id];
            const isMarket = !!region;
            const dimmed = isMarket && region && isDimmed(region.id);
            const fill = isMarket && region ? regionColor(region.id) : 'var(--color-border)';
            const opacity = isMarket ? (dimmed ? 0.18 : 0.45) : 0.18;
            return (
              <path
                key={p.id}
                className="country"
                d={p.d}
                fill={fill}
                opacity={opacity}
                stroke="var(--color-surface-elevated)"
                strokeWidth="0.3"
              />
            );
          })}
        </g>

        {/* Animated trade routes — quadratic curves from Egypt to destinations */}
        <g fill="none" strokeLinecap="round">
          {routes.map((route, i) => {
            const [x1, y1] = EGYPT_COORDS;
            const [x2, y2] = route.dest;
            const midX = (x1 + x2) / 2;
            const midY = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.18 - 20;
            const dimmed = isDimmed(route.regionId);
            const highlighted = hoveredIso === route.iso;
            return (
              <path
                key={`route-${route.iso}`}
                d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                stroke={route.color}
                strokeWidth={highlighted ? 2 : 0.9}
                strokeDasharray="3 4"
                opacity={dimmed ? 0.08 : highlighted ? 0.95 : 0.52}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="14;0"
                  dur={`${3 + (i % 5) * 0.4}s`}
                  repeatCount="indefinite"
                />
              </path>
            );
          })}
        </g>

        {/* Egypt hub — pulsing green dot */}
        <g>
          <circle cx={EGYPT_COORDS[0]} cy={EGYPT_COORDS[1]} r="36" fill="url(#hub-pulse)">
            <animate attributeName="r" values="24;46;24" dur="2.6s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.8;0;0.8"
              dur="2.6s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={EGYPT_COORDS[0]}
            cy={EGYPT_COORDS[1]}
            r="7"
            fill="#147239"
            stroke="white"
            strokeWidth="2.5"
          />
          <text
            className="atlas-egypt-label"
            x={EGYPT_COORDS[0] + 14}
            y={EGYPT_COORDS[1] - 8}
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontSize="15"
            fill="currentColor"
            opacity="0.85"
          >
            {labels.egyptLabel}
          </text>
        </g>

        {/* Destination markers — clickable, hover shows tooltip */}
        <g>
          {routes.map((route) => {
            const dimmed = isDimmed(route.regionId);
            const highlighted = hoveredIso === route.iso;
            const [x, y] = route.dest;
            return (
              <g
                key={`marker-${route.iso}`}
                style={{ opacity: dimmed ? 0.2 : 1, cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIso(route.iso)}
                onMouseLeave={() => setHoveredIso(null)}
                onClick={() =>
                  setActiveRegion(activeRegion === route.regionId ? null : route.regionId)
                }
              >
                <circle cx={x} cy={y} r="9" fill={route.color} opacity="0.18" />
                <circle
                  cx={x}
                  cy={y}
                  r={highlighted ? 5 : 3}
                  fill={route.color}
                  stroke="var(--color-surface-elevated)"
                  strokeWidth="0.8"
                />
                {highlighted &&
                  (() => {
                    // Tooltip width sized for the longer of {name} and {port},
                    // with a minimum readable floor.
                    const w = Math.max(
                      130,
                      Math.max(route.name.length, route.port.length + 6) * 7 + 60,
                    );
                    // Authored as LTR (rect to the RIGHT of marker, text-anchor:start).
                    // The RTL mirror — rect to the left, text-anchor:end — is applied
                    // by `:root[dir='rtl'] .atlas-tooltip__*` in globals.css using
                    // the --tooltip-w custom property below.
                    return (
                      <g
                        className="atlas-tooltip"
                        style={{ ['--tooltip-w' as string]: `${w}px` } as React.CSSProperties}
                      >
                        <rect
                          className="atlas-tooltip__rect"
                          x={x + 10}
                          y={y - 32}
                          width={w}
                          height="48"
                          rx="7"
                          fill="var(--color-surface-elevated)"
                          stroke={route.color}
                          strokeWidth="1"
                        />
                        <text
                          className="atlas-tooltip__text"
                          x={x + 20}
                          y={y - 14}
                          fontSize="13"
                          fontWeight="600"
                          fill="currentColor"
                        >
                          {route.flag} {route.name}
                        </text>
                        <text
                          className="atlas-tooltip__text"
                          x={x + 20}
                          y={y + 1}
                          fontSize="10"
                          fill="currentColor"
                          opacity="0.65"
                        >
                          {labels.portLabel}: {route.port}
                        </text>
                      </g>
                    );
                  })()}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Region filter pills */}
      <div className="atlas-controls">
        <button
          type="button"
          className={`region-pill ${activeRegion === null ? 'active' : ''}`}
          onClick={() => setActiveRegion(null)}
        >
          {labels.allMarkets}
          <span className="region-pill-count">{totalCountries}</span>
        </button>
        {regions.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`region-pill ${activeRegion === r.id ? 'active' : ''}`}
            onClick={() => setActiveRegion(activeRegion === r.id ? null : r.id)}
            style={{ ['--region-color' as string]: regionColor(r.id) } as React.CSSProperties}
          >
            <span className="dot" />
            {pick(r.name, locale)}
            <span className="region-pill-count">{r.countries.length}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
