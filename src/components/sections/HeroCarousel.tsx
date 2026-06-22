'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export type HeroSlideView = {
  image: string;
  eyebrow?: string;
  headline: string;
  subheadline?: string;
};

export type HeroCtaView = {
  label: string;
  href: string;
  external?: boolean;
  className: string;
};

export type HeroMetaView = { num: string; label: string };

const AUTOPLAY_MS = 6000;

/** "Egypt's harvest, frozen at its peak." → italic-emphasises the clause
 *  after the last ASCII comma. (Arabic uses '،' so it stays un-split.) */
function Headline({ text }: { text: string }) {
  const i = text.lastIndexOf(',');
  if (i === -1 || i === text.length - 1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i + 1)} <em>{text.slice(i + 1).trim()}</em>
    </>
  );
}

/**
 * Full-bleed hero carousel (client component, SSG-safe).
 * Crossfades big imagery; copy is per-slide, CTAs + meta are shared.
 * Autoplay pauses on hover/focus and is disabled under reduced-motion.
 */
export function HeroCarousel({
  slides,
  ctas,
  meta,
}: {
  slides: HeroSlideView[];
  ctas: HeroCtaView[];
  meta: HeroMetaView[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback((n: number) => setIndex((p) => (n + count) % count), [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = window.setInterval(() => setIndex((p) => (p + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  return (
    <section
      className={cn('hero-carousel', paused && 'is-paused')}
      style={{ '--hero-autoplay': `${AUTOPLAY_MS}ms` } as CSSProperties}
      aria-roledescription="carousel"
      aria-label="Montana highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="hero-carousel-track" aria-hidden>
        {slides.map((s, i) => (
          <div key={`${s.image}-${i}`} className={cn('hero-slide', i === index && 'is-active')}>
            <Image
              src={s.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="hero-slide-img"
            />
            <div className="hero-slide-veil" />
          </div>
        ))}
      </div>

      <div className="hero-carousel-overlay">
        <div className="hero-carousel-inner">
          {slides.map((s, i) => (
            <div
              key={`${s.image}-${i}`}
              className={cn('hero-copy', i === index && 'is-active')}
              aria-hidden={i === index ? undefined : true}
            >
              {s.eyebrow && (
                <span className="hero-eyebrow">
                  <span className="dot" />
                  {s.eyebrow}
                </span>
              )}
              <h1 className="hero-title">
                <Headline text={s.headline} />
              </h1>
              {s.subheadline && <p className="hero-subtitle">{s.subheadline}</p>}
            </div>
          ))}

          {ctas.length > 0 && (
            <div className="hero-ctas">
              {ctas.map((c) =>
                c.external ? (
                  <a
                    key={c.href}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={c.className}
                  >
                    {c.label}
                    <ArrowRight className="rtl:rotate-180" size={16} />
                  </a>
                ) : (
                  <Link key={c.href} href={c.href} className={c.className}>
                    {c.label}
                    <ArrowRight className="rtl:rotate-180" size={16} />
                  </Link>
                ),
              )}
            </div>
          )}

          {meta.length > 0 && (
            <div className="hero-meta">
              <div className="hero-meta-row">
                {meta.map((m) => (
                  <div key={`${m.num}-${m.label}`} className="hero-meta-item">
                    <span className="num">{m.num}</span>
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="hero-nav prev"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
          >
            <ChevronLeft className="rtl:rotate-180" size={22} />
          </button>
          <button
            type="button"
            className="hero-nav next"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
          >
            <ChevronRight className="rtl:rotate-180" size={22} />
          </button>
          <div className="hero-dots" role="tablist" aria-label="Choose slide">
            {slides.map((s, i) => (
              <button
                key={`${s.image}-${i}`}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                className={cn('hero-dot', i === index && 'is-active')}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
