'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cn } from '@/lib/cn';
import type { Markets } from '@/schemas/markets';
import { pick, type Locale } from '@/lib/i18n';
import { WORLD_MAP_PATHS, WORLD_MAP_W as MAP_W, WORLD_MAP_H as MAP_H } from '@/lib/world-map-paths';

// Approximate country centroids (lat, lng). Drives the pin overlay and click-to-focus animation.
const ISO_LATLNG: Record<string, [number, number]> = {
  // MENA
  SA: [23.886, 45.079],
  AE: [23.424, 53.848],
  KW: [29.312, 47.482],
  BH: [25.93, 50.638],
  QA: [25.355, 51.184],
  OM: [21.473, 55.975],
  JO: [30.585, 36.238],
  LB: [33.855, 35.862],
  SY: [34.802, 38.997],
  IQ: [33.223, 43.679],
  PS: [31.952, 35.233],
  LY: [26.335, 17.228],
  TN: [33.887, 9.537],
  SD: [12.863, 30.218],
  // Europe
  GB: [54.5, -3.0],
  FR: [46.228, 2.214],
  DE: [51.166, 10.452],
  BE: [50.504, 4.47],
  CH: [46.818, 8.228],
  SE: [60.128, 18.644],
  PL: [51.919, 19.145],
  CY: [35.126, 33.43],
  TR: [38.964, 35.243],
  // Americas
  US: [39.5, -98.5],
  CA: [58.0, -100.0],
  // Asia & Pacific
  AU: [-25.274, 133.775],
  NZ: [-40.901, 174.886],
  AF: [33.939, 67.71],
  MU: [-20.348, 57.552],
};

// Countries not present in Natural Earth 110m get a pin instead of a fill.
const ISLAND_PINS = new Set(['BH', 'MU']);

const REGION_COLOR: Record<string, string> = {
  mena: 'var(--color-brand-primary)',
  europe: 'var(--color-brand-orange)',
  americas: 'var(--color-brand-secondary)',
  'asia-pacific': 'var(--color-brand-amber)',
};

// Drag tuning
const DRAG_X_SENSITIVITY = 0.45;
const DRAG_Y_SENSITIVITY = 0.3;
const Y_TILT_CLAMP = 28;
const AUTO_ROTATE_DEG_PER_MS = 0.012; // ≈ 12°/sec — slow ambient spin
const CLICK_THRESHOLD_PX = 4;
const FOCUS_ANIM_MS = 700;

// The map repeats horizontally for seamless wrap. SVG viewBox is doubled in X.
const MAP_REPEAT_W = MAP_W * 2;

// Convert a longitude (degrees) to the panning offset that brings it to globe centre.
// rotation.x in degrees → translateX in viewBox units.
const rotationToTranslateX = (rotationDeg: number) =>
  -(((rotationDeg % 360) + 360) % 360) * (MAP_W / 360);

interface Tooltip {
  iso: string;
  name: string;
  regionId: string;
}

interface MarketsGlobeProps {
  markets: Markets;
  locale: Locale;
}

export function MarketsGlobe({ markets, locale }: MarketsGlobeProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<Tooltip | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;

  const dragStart = useRef<{
    x: number;
    y: number;
    rx: number;
    ry: number;
    moved: number;
  } | null>(null);

  const focusAnim = useRef<number | null>(null);
  const globeRef = useRef<HTMLDivElement | null>(null);

  // ─── ISO → market lookup ───────────────────────────────────────
  const marketByIso = useMemo(() => {
    const map = new Map<string, { regionId: string; name: string }>();
    for (const region of markets.regions) {
      for (const country of region.countries) {
        map.set(country.iso, {
          regionId: region.id,
          name: pick(country.name, locale) ?? country.iso,
        });
      }
    }
    return map;
  }, [markets, locale]);

  // ─── Auto-rotate when idle ─────────────────────────────────────
  useEffect(() => {
    if (dragging || hovered) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      setRotation((r) => ({
        x: r.x + dt * AUTO_ROTATE_DEG_PER_MS,
        // Subtle ease-back of vertical tilt while idle
        y: r.y * Math.exp(-dt / 600),
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging, hovered]);

  // ─── Drag handlers ─────────────────────────────────────────────
  const cancelFocus = () => {
    if (focusAnim.current != null) {
      cancelAnimationFrame(focusAnim.current);
      focusAnim.current = null;
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    cancelFocus();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rx: rotationRef.current.x,
      ry: rotationRef.current.y,
      moved: 0,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current.moved = Math.max(dragStart.current.moved, Math.hypot(dx, dy));
    setRotation({
      x: dragStart.current.rx - dx * DRAG_X_SENSITIVITY,
      y: Math.max(
        -Y_TILT_CLAMP,
        Math.min(Y_TILT_CLAMP, dragStart.current.ry + dy * DRAG_Y_SENSITIVITY),
      ),
    });
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  // ─── Click-to-focus a country ──────────────────────────────────
  const focusCountry = useCallback((iso: string) => {
    const coords = ISO_LATLNG[iso];
    if (!coords) return;
    const [lat, lng] = coords;
    // At rotation.x = 0 the visible centre longitude is -90°; rotation.x of L+90
    // brings longitude L to the centre.
    const targetX = lng + 90;
    // Tilt vertically toward the country's hemisphere, clamped so we don't run
    // out of map.
    const targetY = Math.max(-Y_TILT_CLAMP, Math.min(Y_TILT_CLAMP, -lat * 0.4));
    const start = { ...rotationRef.current };
    // Normalize current X to the shortest arc to target
    const delta = ((targetX - start.x + 540) % 360) - 180;
    const finalX = start.x + delta;
    const t0 = performance.now();
    cancelFocus();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / FOCUS_ANIM_MS);
      const e = 1 - Math.pow(1 - k, 3);
      setRotation({
        x: start.x + (finalX - start.x) * e,
        y: start.y + (targetY - start.y) * e,
      });
      if (k < 1) focusAnim.current = requestAnimationFrame(step);
      else focusAnim.current = null;
    };
    focusAnim.current = requestAnimationFrame(step);
  }, []);

  // ─── Pin positions on the doubled-map viewBox ──────────────────
  const pins = useMemo(() => {
    const project = (lat: number, lng: number): [number, number] => [
      ((lng + 180) * MAP_W) / 360,
      ((90 - lat) * MAP_H) / 180,
    ];
    return markets.regions.flatMap((region) =>
      region.countries
        .map((country) => {
          const coords = ISO_LATLNG[country.iso];
          if (!coords) return null;
          const [x, y] = project(coords[0], coords[1]);
          return {
            iso: country.iso,
            name: pick(country.name, locale) ?? country.iso,
            regionId: region.id,
            x,
            y,
            isIsland: ISLAND_PINS.has(country.iso),
          };
        })
        .filter(
          (
            p,
          ): p is {
            iso: string;
            name: string;
            regionId: string;
            x: number;
            y: number;
            isIsland: boolean;
          } => p !== null,
        ),
    );
  }, [markets, locale]);

  const translateX = rotationToTranslateX(rotation.x);

  // ─── Country fill helpers ──────────────────────────────────────
  const fillForIso = (iso: string) => {
    const m = marketByIso.get(iso);
    if (!m) return 'var(--color-border)';
    return REGION_COLOR[m.regionId] ?? 'var(--color-brand-primary)';
  };

  const onCountryEnter = (iso: string, name: string, regionId: string, e: React.MouseEvent) => {
    setHovered({ iso, name, regionId });
    const rect = globeRef.current?.getBoundingClientRect();
    if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="flex flex-col items-center">
      {/* Globe stage */}
      <div className="relative w-full max-w-[560px]" style={{ aspectRatio: '1 / 1' }}>
        {/* Outer atmosphere glow */}
        <div
          aria-hidden
          className="absolute inset-[-6%] rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-brand-primary) 22%, transparent) 55%, transparent 72%)',
            filter: 'blur(8px)',
          }}
        />

        {/* The globe — circular clip + drag surface */}
        <div
          ref={globeRef}
          className={cn(
            'relative h-full w-full overflow-hidden rounded-full select-none',
            'touch-none',
            dragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          style={{
            background:
              'radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--color-surface) 100%, transparent) 0%, var(--color-brand-cream) 60%, color-mix(in srgb, var(--color-brand-cream) 75%, #000) 100%)',
            boxShadow:
              '0 22px 50px -12px rgba(0,0,0,0.25), inset 0 -10px 40px rgba(0,0,0,0.18), inset 8px 8px 50px rgba(255,255,255,0.4)',
            perspective: '1200px',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onMouseLeave={() => {
            setHovered(null);
            setTooltipPos(null);
          }}
        >
          {/* 3D tilt wrapper — rotateX gives the "looking up/down at the globe" feel */}
          <div
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotation.y * 0.5}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Wider-than-globe wrapper so the SVG can pan left/right behind the circular clip.
              SVG width via CSS on <svg> elements is unreliable cross-browser — use a div. */}
            <div
              className="absolute top-1/2 left-0"
              style={{
                width: '400%',
                height: '100%',
                transform: `translateY(-50%) translateX(${(translateX / MAP_REPEAT_W) * 100}%)`,
                transition: dragging ? 'none' : undefined,
              }}
            >
              <svg
                viewBox={`0 0 ${MAP_REPEAT_W} ${MAP_H}`}
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
                className="block h-full w-full"
              >
                {/* Render countries twice side-by-side for seamless horizontal wrap */}
                {[0, MAP_W].map((offset) => (
                  <g key={offset} transform={`translate(${offset} 0)`}>
                    {WORLD_MAP_PATHS.map(({ iso, d }) => {
                      const market = marketByIso.get(iso);
                      const isHovered = hovered?.iso === iso;
                      return (
                        <path
                          key={iso}
                          d={d}
                          fill={fillForIso(iso)}
                          fillOpacity={market ? (isHovered ? 1 : 0.85) : 0.5}
                          stroke="color-mix(in srgb, var(--color-surface) 80%, transparent)"
                          strokeWidth={0.5}
                          vectorEffect="non-scaling-stroke"
                          style={{
                            cursor: market ? 'pointer' : 'inherit',
                            transition: 'fill-opacity 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            if (!market) return;
                            onCountryEnter(iso, market.name, market.regionId, e);
                          }}
                          onMouseMove={(e) => {
                            if (!market) return;
                            const rect = globeRef.current?.getBoundingClientRect();
                            if (rect)
                              setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }}
                          onClick={() => {
                            if (!market) return;
                            if ((dragStart.current?.moved ?? 0) > CLICK_THRESHOLD_PX) return;
                            focusCountry(iso);
                          }}
                        >
                          {market && <title>{market.name}</title>}
                        </path>
                      );
                    })}

                    {/* Pins for island countries not in the 110m country dataset */}
                    {pins
                      .filter((p) => p.isIsland)
                      .map((p) => {
                        const color = REGION_COLOR[p.regionId] ?? 'var(--color-brand-primary)';
                        const isHovered = hovered?.iso === p.iso;
                        return (
                          <g
                            key={`${offset}-${p.iso}`}
                            transform={`translate(${p.x} ${p.y})`}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => onCountryEnter(p.iso, p.name, p.regionId, e)}
                            onClick={() => {
                              if ((dragStart.current?.moved ?? 0) > CLICK_THRESHOLD_PX) return;
                              focusCountry(p.iso);
                            }}
                          >
                            <title>{p.name}</title>
                            <circle r={5} fill={color} fillOpacity={0.25} />
                            <circle
                              r={isHovered ? 3 : 2.4}
                              fill={color}
                              stroke="#FFF"
                              strokeWidth={0.6}
                            />
                          </g>
                        );
                      })}
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Spherical lighting overlay — sells the globe illusion */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 22%, transparent 45%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 30%, transparent 55%)',
              mixBlendMode: 'soft-light',
            }}
          />
          {/* Rim shadow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow: 'inset 0 0 32px 4px rgba(0,0,0,0.18)',
            }}
          />
        </div>

        {/* Tooltip */}
        {hovered && tooltipPos && (
          <div
            className={cn(
              'pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full',
              'bg-surface-inverse rounded-md px-2.5 py-1 text-xs font-medium text-white shadow-lg',
              'whitespace-nowrap',
            )}
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 12,
            }}
          >
            {hovered.name}
          </div>
        )}
      </div>

      {/* Region legend (clickable → focus first country in region) */}
      <ul className="text-body-sm mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {markets.regions.map((region) => (
          <li key={region.id}>
            <button
              type="button"
              onClick={() => {
                const first = region.countries[0]?.iso;
                if (first) focusCountry(first);
              }}
              className="text-text-muted hover:text-text flex items-center gap-2 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: REGION_COLOR[region.id] ?? 'var(--color-brand-primary)' }}
                aria-hidden
              />
              <span>{pick(region.name, locale)}</span>
              <span className="text-text-muted/60 tabular-nums">({region.countries.length})</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-text-muted/70 mt-3 text-xs">Drag to rotate · Click a country to focus</p>
    </div>
  );
}
