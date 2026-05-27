'use client';

import { useState } from 'react';
import type { Product } from '@/schemas/product';
import { pick, type Locale } from '@/lib/i18n';

const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;

type MonthKey = (typeof MONTHS)[number];

const MONTH_LABELS: Record<MonthKey, { en: string; ar: string; fr: string }> = {
  jan: { en: 'Jan', ar: 'يناير', fr: 'Jan' },
  feb: { en: 'Feb', ar: 'فبراير', fr: 'Fév' },
  mar: { en: 'Mar', ar: 'مارس', fr: 'Mar' },
  apr: { en: 'Apr', ar: 'أبريل', fr: 'Avr' },
  may: { en: 'May', ar: 'مايو', fr: 'Mai' },
  jun: { en: 'Jun', ar: 'يونيو', fr: 'Juin' },
  jul: { en: 'Jul', ar: 'يوليو', fr: 'Juil' },
  aug: { en: 'Aug', ar: 'أغسطس', fr: 'Août' },
  sep: { en: 'Sep', ar: 'سبتمبر', fr: 'Sep' },
  oct: { en: 'Oct', ar: 'أكتوبر', fr: 'Oct' },
  nov: { en: 'Nov', ar: 'نوفمبر', fr: 'Nov' },
  dec: { en: 'Dec', ar: 'ديسمبر', fr: 'Déc' },
};

interface HarvestCalendarProps {
  products: Product[];
  locale: Locale;
  labels: {
    eyebrow: string;
    title: React.ReactNode;
    intro: string;
  };
}

/**
 * Harvest calendar — 12-month × N-product grid showing peak seasons per crop.
 *
 * Each cell paints either:
 *   - peak     → green→terracotta gradient bar (brand + accent tokens)
 *   - off-season → neutral pill on surface-muted
 *
 * Empty `seasonality` arrays are treated as "year-round" (mixed blends like
 * Mixed Vegetables / Peas & Carrots).
 *
 * Row hover scales up the peak cells so the season window pops at a glance.
 * Tap on mobile also persists the highlight.
 */
export function HarvestCalendar({ products, locale, labels }: HarvestCalendarProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  return (
    <section className="harvest-calendar-section">
      <div className="harvest-head">
        <div>
          <span className="eyebrow">{labels.eyebrow}</span>
          <h2 className="harvest-title">{labels.title}</h2>
        </div>
        <p className="harvest-intro">{labels.intro}</p>
      </div>

      <div className="harvest-card">
        <div
          className="harvest-grid"
          role="table"
          aria-label="Harvest calendar — peak season by crop"
        >
          {/* Header row: blank name cell + 12 month labels */}
          <div className="harvest-header-row" role="row">
            <div className="harvest-name-cell" role="columnheader" aria-label="Crop" />
            {MONTHS.map((m) => (
              <div key={m} className="harvest-month-label" role="columnheader">
                {MONTH_LABELS[m][locale]}
              </div>
            ))}
          </div>

          {/* Product rows */}
          {products.map((product) => {
            const name = pick(product.name, locale) ?? product.slug;
            const seasonality = product.seasonality ?? [];
            // Empty seasonality → year-round (Mixed Vegetables / Peas & Carrots blends).
            const yearRound = seasonality.length === 0;
            const peakSet = new Set(seasonality);
            const isHovered = hoveredSlug === product.slug;

            return (
              <div
                key={product.slug}
                className={`harvest-row ${isHovered ? 'is-hovered' : ''}`}
                role="row"
                onMouseEnter={() => setHoveredSlug(product.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                onFocus={() => setHoveredSlug(product.slug)}
                onBlur={() => setHoveredSlug(null)}
                tabIndex={0}
              >
                <div className="harvest-name-cell" role="rowheader">
                  {name}
                </div>
                {MONTHS.map((m) => {
                  const isPeak = yearRound || peakSet.has(m);
                  return (
                    <div
                      key={m}
                      className={`harvest-cell ${isPeak ? 'is-peak' : 'is-off'}`}
                      role="cell"
                      aria-label={`${MONTH_LABELS[m][locale]} ${isPeak ? '— peak' : ''}`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
