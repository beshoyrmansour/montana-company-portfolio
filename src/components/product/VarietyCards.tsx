import { pick, type Locale } from '@/lib/i18n';
import type { Product } from '@/schemas/product';

interface VarietyCardsProps {
  varieties: Product['varieties'];
  locale: Locale;
  title: string;
}

/**
 * Visual grid of variety + size cards.
 * Each variety renders as a card; sizes (if any) render as a clean table inside.
 * Replaces the previous bordered-box accordion style.
 */
export function VarietyCards({ varieties, locale, title }: VarietyCardsProps) {
  if (varieties.length === 0) return null;

  return (
    <div>
      <h2 className="text-display mb-6 font-bold">{title}</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {varieties.map((variety, idx) => (
          <div
            key={idx}
            className="border-border bg-surface overflow-hidden rounded-lg border shadow-xs"
          >
            <header className="border-border bg-surface-muted border-b px-6 py-4">
              <h3 className="text-heading-3 text-text font-semibold">
                {pick(variety.name, locale)}
              </h3>
            </header>
            {variety.sizes && variety.sizes.length > 0 ? (
              <ul className="divide-border divide-y">
                {variety.sizes.map((size, sidx) => (
                  <li key={sidx} className="flex items-center justify-between px-6 py-3">
                    <span className="text-body text-text font-semibold">
                      {pick(size.label, locale)}
                    </span>
                    <span className="text-body-sm text-text-muted font-mono" dir="ltr">
                      {pick(size.spec, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-text-muted px-6 py-4">
                {locale === 'ar' ? 'حسب الطلب' : locale === 'fr' ? 'Sur demande' : 'On request'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
