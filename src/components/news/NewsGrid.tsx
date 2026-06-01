'use client';

import { useState, useMemo, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NewsArticle } from '@/schemas/news';
import { pick, type Locale } from '@/lib/i18n';

interface NewsGridProps {
  articles: NewsArticle[];
  locale: Locale;
  labels: {
    all: string;
    featured: string;
    readMinSuffix: string;
    readMore: string;
    empty: string;
    categories: { id: string; label: string }[];
  };
}

/**
 * Editorial news grid — category filter chips, featured article (when
 * 'All' is active and any article is flagged featured), then a 3-up grid
 * of remaining articles.
 */
export function NewsGrid({ articles, locale, labels }: NewsGridProps) {
  const [activeCat, setActiveCat] = useState<string>('all');

  // All featured articles (newest-first, since `articles` is pre-sorted).
  // Any number is fine — they rotate as a slideshow at the top.
  const featuredList = useMemo(() => articles.filter((a) => a.featured), [articles]);
  const featuredSet = useMemo(() => new Set(featuredList), [featuredList]);

  const filtered = useMemo(() => {
    const pool = articles.filter((a) => !featuredSet.has(a) || activeCat !== 'all');
    if (activeCat === 'all') return pool;
    return pool.filter((a) => a.category === activeCat);
  }, [articles, featuredSet, activeCat]);

  // Estimate read time from EN body word count (fallback shared across locales).
  const readMins = (a: NewsArticle) => {
    const words = (a.body.en ?? '').split(/\s+/).filter(Boolean).length;
    return Math.max(2, Math.round(words / 220));
  };

  const fmtDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale === 'fr' ? 'fr-FR' : 'en-GB', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Featured slideshow — only when no category filter is applied */}
      {activeCat === 'all' && featuredList.length > 0 && (
        <FeaturedCarousel
          items={featuredList}
          locale={locale}
          labels={labels}
          readMins={readMins}
          fmtDate={fmtDate}
        />
      )}

      {/* Filter chips */}
      <div className="news-filter-bar">
        <button
          type="button"
          className={`news-filter-chip ${activeCat === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCat('all')}
        >
          {labels.all}
        </button>
        {labels.categories.map((c) => {
          const count = articles.filter((a) => a.category === c.id).length;
          if (count === 0) return null;
          return (
            <button
              key={c.id}
              type="button"
              className={`news-filter-chip ${activeCat === c.id ? 'active' : ''}`}
              onClick={() => setActiveCat(c.id)}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p
          className="text-body-lg text-text-muted text-center"
          style={{ paddingBlock: 'var(--space-12)' }}
        >
          {labels.empty}
        </p>
      ) : (
        <div className="news-grid-lg" style={{ marginTop: 'var(--space-12)' }}>
          {filtered.map((a) => (
            <Link key={a.slug} href={`/${locale}/news/${a.slug}`} className="news-card-lg">
              <div className="news-image-editorial">
                <Image
                  src={a.coverImage}
                  alt={pick(a.title, locale) ?? ''}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="news-card-body">
                <div className="news-meta-editorial">
                  <span>{a.category}</span>
                  <span className="dot" />
                  <time className="date" dateTime={a.publishedAt}>
                    {fmtDate(a.publishedAt)}
                  </time>
                  <span className="dot" />
                  <span className="date">
                    {readMins(a)} {labels.readMinSuffix}
                  </span>
                </div>
                <h3>{pick(a.title, locale)}</h3>
                <p>{pick(a.excerpt, locale)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Featured slideshow. Renders every `featured: true` article as an
 * auto-rotating hero (with prev/next + dots), and an "expand" toggle that
 * stacks all featured articles at once. Degrades to a plain single hero when
 * only one article is featured.
 */
function FeaturedCarousel({
  items,
  locale,
  labels,
  readMins,
  fmtDate,
}: {
  items: NewsArticle[];
  locale: Locale;
  labels: NewsGridProps['labels'];
  readMins: (a: NewsArticle) => number;
  fmtDate: (iso: string) => string;
}) {
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  const AUTOPLAY_MS = 6000;

  // Auto-advance while collapsed, with >1 slide, and not paused (hover/focus).
  // Re-runs on `current` change so manual navigation restarts the timer.
  useEffect(() => {
    if (expanded || paused || count < 2) return;
    const id = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [expanded, paused, count, current]);

  // Navigate to an index, recording direction so the slide animates in from
  // the correct side.
  const go = (i: number, dir?: number) => {
    const next = ((i % count) + count) % count;
    setDirection(dir ?? (next >= current ? 1 : -1));
    setCurrent(next);
  };

  const expandLabel =
    locale === 'ar'
      ? `عرض كل الأخبار المميزة (${count})`
      : locale === 'fr'
        ? `Voir toutes les actualités à la une (${count})`
        : `View all featured (${count})`;
  const collapseLabel = locale === 'ar' ? 'عرض أقل' : locale === 'fr' ? 'Réduire' : 'Show less';
  const prevLabel = locale === 'ar' ? 'السابق' : locale === 'fr' ? 'Précédent' : 'Previous';
  const nextLabel = locale === 'ar' ? 'التالي' : locale === 'fr' ? 'Suivant' : 'Next';

  if (expanded) {
    return (
      <div className="news-featured-carousel is-expanded">
        <div className="news-featured-stack">
          {items.map((a) => (
            <FeaturedArticle
              key={a.slug}
              article={a}
              locale={locale}
              labels={labels}
              readMins={readMins(a)}
              dateLabel={fmtDate(a.publishedAt)}
            />
          ))}
        </div>
        <div className="news-featured-controls">
          <button type="button" className="news-featured-expand" onClick={() => setExpanded(false)}>
            {collapseLabel}
          </button>
        </div>
      </div>
    );
  }

  const active = items[current] ?? items[0];
  if (!active) return null;
  return (
    <div
      className="news-featured-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <FeaturedArticle
        key={active.slug}
        article={active}
        locale={locale}
        labels={labels}
        readMins={readMins(active)}
        dateLabel={fmtDate(active.publishedAt)}
        animClass={`news-featured-anim ${direction >= 0 ? 'is-next' : 'is-prev'}`}
      />
      {count > 1 && (
        <div className="news-featured-controls">
          <button
            type="button"
            className="news-featured-nav"
            aria-label={prevLabel}
            onClick={() => go(current - 1, -1)}
          >
            <ChevronLeft size={18} className="rtl:rotate-180" />
          </button>
          <div className="news-featured-dots" role="tablist" aria-label={labels.featured}>
            {items.map((a, i) => (
              <button
                key={a.slug}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={pick(a.title, locale) ?? a.slug}
                className={`news-featured-dot ${i === current ? 'active' : ''}`}
                onClick={() => go(i)}
              >
                {i === current && (
                  <span
                    key={current}
                    className="news-featured-dot-fill"
                    style={{
                      animationDuration: `${AUTOPLAY_MS}ms`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="news-featured-nav"
            aria-label={nextLabel}
            onClick={() => go(current + 1, 1)}
          >
            <ChevronRight size={18} className="rtl:rotate-180" />
          </button>
          <button type="button" className="news-featured-expand" onClick={() => setExpanded(true)}>
            {expandLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function FeaturedArticle({
  article,
  locale,
  labels,
  readMins,
  dateLabel,
  animClass = '',
}: {
  article: NewsArticle;
  locale: Locale;
  labels: NewsGridProps['labels'];
  readMins: number;
  dateLabel: string;
  animClass?: string;
}) {
  return (
    <article className={`news-featured${animClass ? ` ${animClass}` : ''}`}>
      <div className="news-featured-media">
        <Image
          src={article.coverImage}
          alt={pick(article.title, locale) ?? ''}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
      </div>
      <div className="news-featured-body">
        <div className="news-featured-meta">
          <span className="news-featured-cat">
            {labels.featured} · {article.category}
          </span>
          <span className="dot" />
          <time dateTime={article.publishedAt}>{dateLabel}</time>
          <span className="dot" />
          <span>
            {readMins} {labels.readMinSuffix}
          </span>
        </div>
        <h2 className="news-featured-title">{pick(article.title, locale)}</h2>
        <p className="news-featured-excerpt">{pick(article.excerpt, locale)}</p>
        <Link
          href={`/${locale}/news/${article.slug}`}
          className="btn-editorial primary"
          style={{ alignSelf: 'flex-start' }}
        >
          {labels.readMore}
          <ArrowRight size={16} className="rtl:rotate-180" />
        </Link>
      </div>
    </article>
  );
}

interface NewsletterFormProps {
  locale: Locale;
  labels: {
    placeholder: string;
    submit: string;
    success: string;
  };
}

/** Tiny newsletter signup form for the bottom CTA. Best-effort POST. */
export function NewsletterForm({ locale: _locale, labels }: NewsletterFormProps) {
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await fetch('/api/newsletter', { method: 'POST', body: fd });
    } catch {
      // accept anyway in preview
    }
    setDone(true);
  }

  if (done) {
    return (
      <p
        className="news-subscribe"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          color: 'white',
          margin: 'var(--space-4) 0 0',
        }}
      >
        ✓ {labels.success}
      </p>
    );
  }

  return (
    <form className="news-subscribe" onSubmit={onSubmit}>
      <input type="email" name="email" placeholder={labels.placeholder} required />
      <button type="submit" className="btn-editorial primary">
        {labels.submit}
      </button>
    </form>
  );
}
