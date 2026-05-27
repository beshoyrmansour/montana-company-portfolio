/**
 * Theme decoration primitives — ported from Claude Design handoff.
 *
 * All ornaments are pure server components (no state, no client effects),
 * which means they get statically rendered and inlined into the export.
 * `ThemeAtmosphere` is the one client component because it generates
 * random positions with `Math.random()` and needs `useMemo` stability.
 */

import type { Theme } from '@/lib/theme';

/* ─────────────────────────────────────────────────────────────────
 * SectionDivider — small ornamental divider between sections.
 * ───────────────────────────────────────────────────────────────── */

export function SectionDivider({ theme }: { theme: Theme }) {
  if (theme === 'ramadan') {
    return (
      <div className="section-divider divider-ramadan" aria-hidden="true">
        <span className="line" />
        <svg viewBox="0 0 80 24" fill="none">
          {/* Mosque-arch silhouette */}
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M 30 22 L 30 12 Q 30 4 40 4 Q 50 4 50 12 L 50 22" />
            <line x1="20" y1="22" x2="60" y2="22" />
          </g>
          {/* 5-point star (between arches) */}
          <path
            d="M 40 4 L 41 7 L 44 7 L 41.5 9 L 42.5 12 L 40 10 L 37.5 12 L 38.5 9 L 36 7 L 39 7 Z"
            fill="currentColor"
          />
        </svg>
        <span className="line" />
      </div>
    );
  }
  if (theme === 'christmas') {
    return (
      <div className="section-divider divider-christmas" aria-hidden="true">
        <span className="line" />
        <svg viewBox="0 0 80 24" fill="none">
          {/* Pine branch + bauble */}
          <g stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round">
            <line x1="10" y1="12" x2="70" y2="12" />
            {[18, 30, 50, 62].map((x) => (
              <g key={x}>
                <line x1={x} y1="12" x2={x - 5} y2="6" />
                <line x1={x} y1="12" x2={x + 5} y2="6" />
                <line x1={x} y1="12" x2={x - 5} y2="18" />
                <line x1={x} y1="12" x2={x + 5} y2="18" />
              </g>
            ))}
          </g>
          <circle cx="40" cy="12" r="4" fill="currentColor" />
          <circle cx="40" cy="12" r="2" fill="white" opacity="0.4" />
        </svg>
        <span className="line" />
      </div>
    );
  }
  // default — subtle dot rule
  return (
    <div className="section-divider divider-default" aria-hidden="true">
      <span className="line" />
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
      <span className="line" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * TitleAccent — small ornament flanking section headlines.
 * ───────────────────────────────────────────────────────────────── */

export function TitleAccent({ theme, side = 'start' }: { theme: Theme; side?: 'start' | 'end' }) {
  if (theme === 'default') return null;
  return (
    <span className={`title-accent title-accent-${side}`}>
      {theme === 'ramadan' ? <RamadanCrescent /> : <ChristmasStar />}
    </span>
  );
}

function RamadanCrescent() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M 24 6 A 12 12 0 1 0 24 30 A 9 9 0 1 1 24 6 Z" fill="var(--color-gold)" />
      <path
        d="M 8 12 L 9 14.5 L 11.5 14.5 L 9.5 16 L 10.5 18.5 L 8 17 L 5.5 18.5 L 6.5 16 L 4.5 14.5 L 7 14.5 Z"
        fill="var(--color-gold)"
      />
    </svg>
  );
}

function ChristmasStar() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <g stroke="var(--color-brand-secondary)" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="4" x2="18" y2="32" />
        <line x1="4" y1="18" x2="32" y2="18" />
        <line x1="8" y1="8" x2="28" y2="28" />
        <line x1="28" y1="8" x2="8" y2="28" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * GreetingOrnament — small glyph for the greeting strip endpoints.
 * ───────────────────────────────────────────────────────────────── */

export function GreetingOrnament({ theme }: { theme: Theme }) {
  if (theme === 'ramadan') {
    return (
      <svg className="greeting-ornament" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M 16 4 A 8 8 0 1 0 16 20 A 6 6 0 1 1 16 4 Z" fill="currentColor" />
        <path
          d="M 5 8 L 5.5 9.5 L 7 9.5 L 5.75 10.5 L 6.25 12 L 5 11 L 3.75 12 L 4.25 10.5 L 3 9.5 L 4.5 9.5 Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (theme === 'christmas') {
    return (
      <svg className="greeting-ornament" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </g>
      </svg>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────
 * HeaderGarland — strip beneath the header, theme-specific.
 * ───────────────────────────────────────────────────────────────── */

export function HeaderGarland({ theme }: { theme: Theme }) {
  if (theme === 'christmas') {
    return (
      <div className="header-garland garland-christmas" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="xMidYMin slice">
          <path
            d="M -20 30 Q 90 60 180 30 Q 270 0 360 30 Q 450 60 540 30 Q 630 0 720 30 Q 810 60 900 30 Q 990 0 1080 30 Q 1170 60 1260 30 Q 1350 0 1460 30"
            stroke="var(--color-brand-primary)"
            strokeWidth="3"
            fill="none"
          />
          {Array.from({ length: 36 }).map((_, i) => {
            const x = 20 + i * 40;
            const y = 30 + Math.sin((i / 4.5) * Math.PI) * 20;
            return (
              <g
                key={i}
                stroke="var(--color-brand-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.85"
              >
                <line x1={x} y1={y} x2={x - 10} y2={y - 14} />
                <line x1={x} y1={y} x2={x + 10} y2={y - 14} />
                <line x1={x} y1={y} x2={x - 14} y2={y - 4} />
                <line x1={x} y1={y} x2={x + 14} y2={y - 4} />
                <line x1={x} y1={y} x2={x} y2={y + 14} />
              </g>
            );
          })}
          {[120, 260, 380, 520, 660, 800, 940, 1080, 1220, 1360].map((x, i) => {
            const y = 30 + Math.sin(((x - 20) / 180) * Math.PI) * 20 + 20;
            const isGold = i % 2 === 0;
            return (
              <g key={x}>
                <line
                  x1={x}
                  y1={y - 22}
                  x2={x}
                  y2={y - 6}
                  stroke="var(--color-brand-primary)"
                  strokeWidth="1"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill={isGold ? 'var(--color-gold)' : 'var(--color-brand-secondary)'}
                />
                <circle cx={x - 1.5} cy={y - 1.5} r="1.5" fill="white" opacity="0.6" />
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
  if (theme === 'ramadan') {
    return (
      <div className="header-garland garland-ramadan" aria-hidden="true">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="xMidYMin slice">
          <line
            x1="0"
            y1="2"
            x2="1440"
            y2="2"
            stroke="var(--color-gold)"
            strokeWidth="1"
            opacity="0.6"
          />
          {[180, 460, 720, 980, 1260].map((x, i) => {
            const y = 18 + (i % 2) * 8;
            return (
              <g key={x} stroke="var(--color-gold)" strokeWidth="1.2" fill="none">
                <line x1={x} y1="2" x2={x} y2={y} />
                <path
                  d={`M ${x - 10} ${y} L ${x + 10} ${y} L ${x + 8} ${y + 4} L ${x - 8} ${y + 4} Z`}
                  fill="var(--color-gold)"
                />
                <path
                  d={`M ${x - 11} ${y + 4} L ${x + 11} ${y + 4} L ${x + 14} ${y + 18} Q ${x + 16} ${y + 30} ${x + 14} ${y + 42} L ${x + 11} ${y + 54} L ${x - 11} ${y + 54} L ${x - 14} ${y + 42} Q ${x - 16} ${y + 30} ${x - 14} ${y + 18} Z`}
                />
                <circle cx={x} cy={y + 30} r="8" fill="var(--color-gold)" opacity="0.4" />
                <circle cx={x} cy={y + 30} r="3" fill="var(--color-gold)" />
                <path
                  d={`M ${x - 9} ${y + 54} L ${x + 9} ${y + 54} L ${x + 7} ${y + 60} L ${x - 7} ${y + 60} Z`}
                  fill="var(--color-gold)"
                />
                <line x1={x} y1={y + 60} x2={x} y2={y + 70} />
                <circle cx={x} cy={y + 72} r="2" fill="var(--color-gold)" />
              </g>
            );
          })}
          {[300, 580, 840, 1100, 1380].map((x) => (
            <path
              key={x}
              d={`M ${x} 18 L ${x + 2} 24 L ${x + 8} 24 L ${x + 3} 28 L ${x + 5} 34 L ${x} 30 L ${x - 5} 34 L ${x - 3} 28 L ${x - 8} 24 L ${x - 2} 24 Z`}
              fill="var(--color-gold)"
              opacity="0.7"
            />
          ))}
        </svg>
      </div>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────
 * HeroOrnaments — overlaid on the hero image panel.
 * ───────────────────────────────────────────────────────────────── */

export function HeroOrnaments({ theme }: { theme: Theme }) {
  if (theme === 'ramadan') {
    return (
      <>
        <svg
          className="hero-ornament top-right"
          viewBox="0 0 300 300"
          fill="none"
          aria-hidden="true"
          style={{ color: 'var(--ornament-color)' }}
        >
          <defs>
            <radialGradient id="moonGlow">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="80" r="80" fill="url(#moonGlow)" />
          <path
            d="M 220 50 A 70 70 0 1 0 220 190 A 52 52 0 1 1 220 50 Z"
            fill="currentColor"
            opacity="0.95"
          />
          <g fill="currentColor">
            <path d="M 80 60 L 84 72 L 96 72 L 86 80 L 90 92 L 80 84 L 70 92 L 74 80 L 64 72 L 76 72 Z" />
            <path d="M 40 130 L 43 138 L 51 138 L 44 144 L 47 152 L 40 147 L 33 152 L 36 144 L 29 138 L 37 138 Z" />
            <path d="M 110 180 L 113 188 L 121 188 L 114 194 L 117 202 L 110 197 L 103 202 L 106 194 L 99 188 L 107 188 Z" />
          </g>
        </svg>
      </>
    );
  }
  if (theme === 'christmas') {
    return (
      <>
        <svg
          className="hero-ornament top-right"
          viewBox="0 0 300 300"
          fill="none"
          aria-hidden="true"
          style={{ color: 'var(--ornament-color)' }}
        >
          <defs>
            <radialGradient id="frostGlow" cx="100%" cy="0%" r="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.55" />
              <stop offset="60%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="300" height="300" fill="url(#frostGlow)" />
          <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M 300 30 Q 200 60 120 150 T 30 280" strokeWidth="2.5" />
            {Array.from({ length: 9 }).map((_, i) => {
              const t = i / 9;
              const x = 300 - t * 270;
              const y = 30 + Math.pow(t, 1.4) * 250;
              return (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <line x1="0" y1="0" x2="-18" y2="-8" />
                  <line x1="0" y1="0" x2="18" y2="-8" />
                  <line x1="0" y1="0" x2="-22" y2="0" />
                  <line x1="0" y1="0" x2="22" y2="0" />
                </g>
              );
            })}
          </g>
          <g>
            <circle cx="180" cy="90" r="8" fill="var(--color-brand-secondary)" />
            <circle cx="180" cy="90" r="3" fill="white" opacity="0.6" />
            <circle cx="100" cy="180" r="9" fill="currentColor" />
            <circle cx="100" cy="180" r="3" fill="white" opacity="0.5" />
          </g>
        </svg>
      </>
    );
  }
  // default — geometric sunburst + olive branch
  return (
    <>
      <svg
        className="hero-ornament top-right"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
        style={{ color: 'var(--ornament-color)' }}
      >
        <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7">
          <circle cx="100" cy="100" r="22" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r1 = 32,
              r2 = 50;
            return (
              <line
                key={i}
                x1={100 + Math.cos(a) * r1}
                y1={100 + Math.sin(a) * r1}
                x2={100 + Math.cos(a) * r2}
                y2={100 + Math.sin(a) * r2}
              />
            );
          })}
        </g>
      </svg>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * WorldMap — dotted continents + pulsing market hubs.
 * ───────────────────────────────────────────────────────────────── */

export function WorldMap() {
  const accentColor = 'var(--ornament-color)';
  const baseColor = 'rgba(255,255,255,0.18)';
  const brandColor = 'var(--color-brand-primary)';

  // Pre-computed continent dots (deterministic — calculated once at module load,
  // produces stable static-export output)
  const continentDots = continentDotsCached();

  const markets = [
    { x: 130, y: 150, label: 'USA' },
    { x: 360, y: 130, label: 'EU' },
    { x: 395, y: 200, label: 'Egypt' },
    { x: 440, y: 165, label: 'KSA' },
    { x: 460, y: 175, label: 'UAE' },
    { x: 470, y: 145, label: 'Türkiye' },
    { x: 565, y: 195, label: 'India' },
    { x: 145, y: 175, label: 'Mexico' },
    { x: 645, y: 200, label: 'Japan' },
    { x: 660, y: 350, label: 'Australia' },
    { x: 200, y: 290, label: 'Brazil' },
    { x: 410, y: 320, label: 'S. Africa' },
    { x: 605, y: 270, label: 'Indonesia' },
  ];

  return (
    <svg viewBox="0 0 800 450" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="hubGlow">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id="dotBlur">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      <circle cx="395" cy="200" r="120" fill="url(#hubGlow)" />
      <g filter="url(#dotBlur)" fill={baseColor}>
        {continentDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} />
        ))}
      </g>
      <g stroke={accentColor} strokeWidth="0.8" fill="none" opacity="0.4" strokeDasharray="2 3">
        {markets
          .filter((m) => m.label !== 'Egypt')
          .map((m, i) => {
            const cx = (395 + m.x) / 2;
            const cy = Math.min(395, m.y) - 60;
            return <path key={i} d={`M 395 200 Q ${cx} ${cy} ${m.x} ${m.y}`} />;
          })}
      </g>
      <g>
        {markets.map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r="8" fill={accentColor} opacity="0.18" />
            <circle cx={m.x} cy={m.y} r="3.5" fill={accentColor}>
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="3s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </g>
      <g>
        <circle cx="395" cy="200" r="16" fill={brandColor} opacity="0.3">
          <animate attributeName="r" values="14;24;14" dur="2.4s" repeatCount="indefinite" />
          <animate
            attributeName="opacity"
            values="0.45;0;0.45"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="395" cy="200" r="6" fill={brandColor} stroke="white" strokeWidth="2" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * CornerOrnament — large fixed decoration in the top corner.
 * Christmas: pine bough with bow. Ramadan: hanging crescent badge.
 * Default theme renders nothing.
 * ───────────────────────────────────────────────────────────────── */

export function CornerOrnament({ theme }: { theme: Theme }) {
  if (theme === 'christmas') {
    return (
      <div className="corner-ornament corner-christmas" aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none">
          <g stroke="var(--color-brand-primary)" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M 200 0 Q 140 50 90 110 T 0 200" strokeWidth="2.5" />
            {Array.from({ length: 8 }).map((_, i) => {
              const t = i / 8;
              const x = 200 - t * 200;
              const y = 0 + Math.pow(t, 1.4) * 200;
              return (
                <g key={i}>
                  <line x1={x} y1={y} x2={x - 16} y2={y - 10} />
                  <line x1={x} y1={y} x2={x + 16} y2={y - 10} />
                  <line x1={x} y1={y} x2={x - 22} y2={y} />
                  <line x1={x} y1={y} x2={x + 22} y2={y} />
                </g>
              );
            })}
          </g>
          <g transform="translate(140 50)">
            <path
              d="M -20 0 Q -28 -10 -18 -14 Q -8 -10 0 0 Q -8 10 -18 14 Q -28 10 -20 0 Z"
              fill="var(--color-brand-secondary)"
            />
            <path
              d="M 20 0 Q 28 -10 18 -14 Q 8 -10 0 0 Q 8 10 18 14 Q 28 10 20 0 Z"
              fill="var(--color-brand-secondary)"
            />
            <rect x="-4" y="-6" width="8" height="12" rx="1" fill="var(--color-brand-secondary)" />
            <rect
              x="-3"
              y="-5"
              width="6"
              height="10"
              rx="1"
              fill="var(--color-gold)"
              opacity="0.7"
            />
          </g>
          <circle cx="100" cy="100" r="9" fill="var(--color-brand-secondary)" />
          <circle cx="98" cy="98" r="3" fill="white" opacity="0.6" />
          <circle cx="60" cy="160" r="7" fill="var(--color-gold)" />
        </svg>
      </div>
    );
  }
  if (theme === 'ramadan') {
    return (
      <div className="corner-ornament corner-ramadan" aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none">
          <circle cx="60" cy="60" r="48" fill="var(--color-gold)" opacity="0.10" />
          <path
            d="M 80 28 A 38 38 0 1 0 80 92 A 28 28 0 1 1 80 28 Z"
            fill="var(--color-gold)"
            opacity="0.85"
          />
          {[
            { x: 130, y: 70, s: 8 },
            { x: 30, y: 130, s: 6 },
            { x: 110, y: 140, s: 7 },
            { x: 160, y: 120, s: 5 },
            { x: 70, y: 170, s: 6 },
          ].map((s, i) => (
            <path
              key={i}
              d={`M ${s.x} ${s.y - s.s} L ${s.x + s.s / 3} ${s.y - s.s / 3} L ${s.x + s.s} ${s.y} L ${s.x + s.s / 3} ${s.y + s.s / 3} L ${s.x} ${s.y + s.s} L ${s.x - s.s / 3} ${s.y + s.s / 3} L ${s.x - s.s} ${s.y} L ${s.x - s.s / 3} ${s.y - s.s / 3} Z`}
              fill="var(--color-gold)"
              opacity={0.5 + (i % 2) * 0.3}
            />
          ))}
        </svg>
      </div>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────
 * ThemeAtmosphere — full-page animated effects per theme.
 *
 * Server-rendered with deterministic positions (seeded PRNG) so static
 * export stays reproducible and there's no client-side hydration jitter.
 *
 *  - Ramadan:   28 twinkling gold stars in the top 60% of the viewport
 *  - Christmas: 36 falling snowflakes drifting from top to bottom
 *
 * Animations are pure CSS — defined in globals.css via @keyframes
 * ra-twinkle (Ramadan) and xm-fall (Christmas). Respects prefers-reduced-motion.
 * ───────────────────────────────────────────────────────────────── */

export function ThemeAtmosphere({ theme }: { theme: Theme }) {
  if (theme === 'default') return null;
  // Seed varies per theme so positions don't collide if you ever stack them
  const seed = theme === 'ramadan' ? 1985 : 2025;
  const rng = mulberry32(seed);

  if (theme === 'ramadan') {
    const stars = Array.from({ length: 28 }, () => ({
      x: rng() * 100,
      y: rng() * 60,
      size: 2 + rng() * 3,
      delay: rng() * 4,
      duration: 2.5 + rng() * 3,
    }));
    return (
      <div className="theme-atmosphere atmosphere-ramadan" aria-hidden="true">
        {stars.map((s, i) => (
          <span
            key={i}
            className="ra-star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>
    );
  }

  // christmas
  const flakes = Array.from({ length: 36 }, () => ({
    x: rng() * 100,
    size: 10 + rng() * 16,
    delay: rng() * 18,
    duration: 14 + rng() * 14,
    drift: -40 + rng() * 80,
    opacity: 0.45 + rng() * 0.45,
  }));
  return (
    <div className="theme-atmosphere atmosphere-christmas" aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="xm-flake"
          style={
            {
              left: `${f.x}%`,
              fontSize: `${f.size}px`,
              opacity: f.opacity,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
              ['--drift' as string]: `${f.drift}px`,
            } as React.CSSProperties
          }
        >
          ❄
        </span>
      ))}
    </div>
  );
}

/** Mulberry32 — small deterministic PRNG for reproducible static export. */
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic seeded dots — same output every build, no hydration mismatch. */
function continentDotsCached(): { x: number; y: number; r: number }[] {
  // Mulberry32 — small deterministic PRNG so static export is reproducible
  let s = 1985;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const continents = [
    { cx: 130, cy: 140, w: 90, h: 80 },
    { cx: 180, cy: 280, w: 50, h: 100 },
    { cx: 360, cy: 130, w: 70, h: 60 },
    { cx: 380, cy: 240, w: 70, h: 110 },
    { cx: 460, cy: 160, w: 50, h: 50 },
    { cx: 540, cy: 170, w: 120, h: 90 },
    { cx: 600, cy: 270, w: 50, h: 50 },
    { cx: 640, cy: 340, w: 60, h: 40 },
  ];
  const dots: { x: number; y: number; r: number }[] = [];
  continents.forEach((c) => {
    for (let i = 0; i < 80; i++) {
      const dx = (rand() - 0.5) * c.w;
      const dy = (rand() - 0.5) * c.h;
      if ((dx * dx) / (c.w / 2) ** 2 + (dy * dy) / (c.h / 2) ** 2 > 0.95) continue;
      dots.push({ x: c.cx + dx, y: c.cy + dy, r: 1.6 });
    }
  });
  return dots;
}
