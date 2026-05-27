'use client';

import { useState, useMemo, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

  const featured = useMemo(() => articles.find((a) => a.featured), [articles]);

  const filtered = useMemo(() => {
    const pool = articles.filter((a) => a !== featured || activeCat !== 'all');
    if (activeCat === 'all') return pool;
    return pool.filter((a) => a.category === activeCat);
  }, [articles, featured, activeCat]);

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
      {/* Featured article — only when no filter applied */}
      {activeCat === 'all' && featured && (
        <FeaturedArticle
          article={featured}
          locale={locale}
          labels={labels}
          readMins={readMins(featured)}
          dateLabel={fmtDate(featured.publishedAt)}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.coverImage}
                  alt={pick(a.title, locale) ?? ''}
                  width={800}
                  height={500}
                  loading="lazy"
                  decoding="async"
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

function FeaturedArticle({
  article,
  locale,
  labels,
  readMins,
  dateLabel,
}: {
  article: NewsArticle;
  locale: Locale;
  labels: NewsGridProps['labels'];
  readMins: number;
  dateLabel: string;
}) {
  return (
    <article className="news-featured">
      <div className="news-featured-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.coverImage}
          alt={pick(article.title, locale) ?? ''}
          width={1200}
          height={750}
          loading="eager"
          fetchPriority="high"
          decoding="async"
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
