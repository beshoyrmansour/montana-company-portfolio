import { pick, type Locale } from '@/lib/i18n';
import type { Product } from '@/schemas/product';
import { PackagingTable } from './PackagingTable';

interface PackingOptionsProps {
  packaging: Product['packaging'];
  varieties: Product['varieties'];
  locale: Locale;
  labels: {
    /** Section title, e.g. "Packing options & sizes" */
    title: string;
    /** Sub-heading for the sizes / cuts block */
    sizes: string;
    /** Sub-heading for the pack-format table */
    formats: string;
    /** PackagingTable column labels */
    type: string;
    weight: string;
    perCarton: string;
  };
}

/**
 * One consolidated section presenting a product's available packing options and
 * sizes:
 *   - "Sizes & cuts" — graded varieties render as cards with a size table
 *     (e.g. okra's 5 grades); cut/form variants (e.g. "Diced 1cm") render as pills.
 *   - "Pack formats" — retail / foodservice / bulk packs with net weight and
 *     units per carton (reuses PackagingTable).
 */
export function PackingOptions({ packaging, varieties, locale, labels }: PackingOptionsProps) {
  const graded = varieties.filter((v) => v.sizes && v.sizes.length > 0);
  const cuts = varieties.filter((v) => !v.sizes || v.sizes.length === 0);
  const hasSizes = varieties.length > 0;
  const hasFormats = packaging.length > 0;
  if (!hasSizes && !hasFormats) return null;

  return (
    <div>
      <h2 className="text-display mb-8 font-bold">{labels.title}</h2>

      {hasSizes && (
        <div className="mb-12">
          <h3 className="eyebrow text-text-muted mb-5">{labels.sizes}</h3>

          {graded.length > 0 && (
            <div className="mb-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {graded.map((variety, idx) => (
                <div
                  key={idx}
                  className="border-border bg-surface overflow-hidden rounded-lg border shadow-xs"
                >
                  <header className="border-border bg-surface-muted border-b px-6 py-4">
                    <h4 className="text-heading-3 text-text font-semibold">
                      {pick(variety.name, locale)}
                    </h4>
                  </header>
                  <ul className="divide-border divide-y">
                    {variety.sizes!.map((size, sidx) => (
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
                </div>
              ))}
            </div>
          )}

          {cuts.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {cuts.map((variety, idx) => (
                <li
                  key={idx}
                  className="border-border bg-surface text-body-sm text-text rounded-full border px-4 py-2 font-medium"
                >
                  {pick(variety.name, locale)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {hasFormats && (
        <div>
          <h3 className="eyebrow text-text-muted mb-5">{labels.formats}</h3>
          <PackagingTable
            packaging={packaging}
            labels={{ type: labels.type, weight: labels.weight, perCarton: labels.perCarton }}
          />
        </div>
      )}
    </div>
  );
}
