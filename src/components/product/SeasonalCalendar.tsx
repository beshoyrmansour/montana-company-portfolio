import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';

interface SeasonalCalendarProps {
  /** Array of 3-letter month abbreviations the product is in season for */
  months: ReadonlyArray<
    'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec'
  >;
  locale: Locale;
  title?: string;
  /** Optional caption shown below the calendar */
  caption?: string;
}

const ALL_MONTHS = [
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

const MONTH_LABELS: Record<Locale, Record<(typeof ALL_MONTHS)[number], string>> = {
  en: {
    jan: 'Jan',
    feb: 'Feb',
    mar: 'Mar',
    apr: 'Apr',
    may: 'May',
    jun: 'Jun',
    jul: 'Jul',
    aug: 'Aug',
    sep: 'Sep',
    oct: 'Oct',
    nov: 'Nov',
    dec: 'Dec',
  },
  ar: {
    jan: 'يناير',
    feb: 'فبراير',
    mar: 'مارس',
    apr: 'أبريل',
    may: 'مايو',
    jun: 'يونيو',
    jul: 'يوليو',
    aug: 'أغسطس',
    sep: 'سبتمبر',
    oct: 'أكتوبر',
    nov: 'نوفمبر',
    dec: 'ديسمبر',
  },
  fr: {
    jan: 'Jan',
    feb: 'Fév',
    mar: 'Mar',
    apr: 'Avr',
    may: 'Mai',
    jun: 'Juin',
    jul: 'Juil',
    aug: 'Août',
    sep: 'Sep',
    oct: 'Oct',
    nov: 'Nov',
    dec: 'Déc',
  },
};

/**
 * 12-month grid showing when a product is in season.
 * Year-round products (empty months array) render the whole row in brand color.
 */
export function SeasonalCalendar({ months, locale, title, caption }: SeasonalCalendarProps) {
  const inSeason = new Set(months);
  const yearRound = months.length === 0;

  return (
    <div>
      {title && <h3 className="text-heading-3 mb-4 font-semibold">{title}</h3>}
      <div className="border-border bg-surface overflow-hidden rounded-lg border">
        <ul className="bg-border grid grid-cols-6 gap-px md:grid-cols-12">
          {ALL_MONTHS.map((m) => {
            const active = yearRound || inSeason.has(m);
            return (
              <li
                key={m}
                className={cn(
                  'flex flex-col items-center gap-1 px-1 py-3 text-center',
                  active ? 'bg-brand-primary text-brand-primary-fg' : 'bg-surface text-text-subtle',
                )}
              >
                <span
                  className={cn(
                    'text-caption font-semibold tracking-wider uppercase',
                    active ? 'opacity-90' : 'opacity-70',
                  )}
                >
                  {MONTH_LABELS[locale][m]}
                </span>
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    active ? 'bg-brand-primary-fg/80' : 'bg-border-strong',
                  )}
                  aria-hidden
                />
              </li>
            );
          })}
        </ul>
      </div>
      {caption && <p className="text-body-sm text-text-muted mt-3">{caption}</p>}
      {yearRound && (
        <p className="text-body-sm text-brand-primary mt-3 font-medium">
          {locale === 'ar'
            ? 'متوفر على مدار العام'
            : locale === 'fr'
              ? "Disponible toute l'année"
              : 'Available year-round'}
        </p>
      )}
    </div>
  );
}
