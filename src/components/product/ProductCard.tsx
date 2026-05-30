import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/primitives/Badge';
import { pick, type Locale } from '@/lib/i18n';
import type { Product } from '@/schemas/product';

interface ProductCardProps {
  product: Product;
  locale: Locale;
  priority?: boolean;
  className?: string;
}

/**
 * Product card (editorial v2).
 *
 * Visual contract:
 *   - 4:5 portrait image area on a muted surface
 *   - Origin eyebrow with editorial small-cap rule
 *   - Display-serif product name
 *   - Footer with grade + arrow CTA that fills on hover
 *   - Theme top-stripe (gold / candy-stripe) painted by globals.css
 *
 * The image uses `object-contain` so the new transparent packshots
 * sit nicely on the surface, with `.cover` opting back to crop for
 * the legacy bowl JPGs.
 */
export function ProductCard({ product, locale, priority, className }: ProductCardProps) {
  const name = pick(product.name, locale) ?? product.slug;
  const short = pick(product.shortDescription, locale);
  const primary = product.images.primary;

  // Origin lede — prefer category, fall back to a placeholder
  const origin = product.category ? labelForCategory(product.category, locale) : 'Egypt';

  // Grade summary — prefer first packaging spec, then varieties count
  const grade = product.packaging?.[0]
    ? `${product.packaging[0].weight}`
    : product.varieties?.length
      ? `${product.varieties.length} cuts`
      : 'IQF';

  // Bowl JPGs need object-cover; transparent pack PNGs need object-contain
  const isPack = primary.includes('-pack.') || primary.endsWith('.png');
  const imageClass = isPack ? 'product-image-editorial' : 'product-image-editorial cover';

  return (
    <Link
      href={`/${locale}/catalog/${product.slug}`}
      className={`product-card-editorial ${className ?? ''}`}
      prefetch={false}
    >
      <div className={imageClass}>
        {product.badges.length > 0 && (
          <div className="product-badges-editorial">
            {product.badges.slice(0, 2).map((b) => (
              <Badge key={b} variant={b} size="sm">
                {b}
              </Badge>
            ))}
          </div>
        )}
        <Image
          src={primary}
          alt={`${name} — Montana frozen`}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          priority={priority}
        />
      </div>
      <div className="product-body-editorial">
        <span className="product-eyebrow-editorial">{origin}</span>
        <h3 className="product-name-editorial">{name}</h3>
        {short && <p className="product-desc-editorial">{short}</p>}
        <div className="product-foot-editorial">
          <span className="grade">{grade}</span>
          <span className="arrow" aria-hidden>
            <ArrowRight size={14} className="rtl:rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Map product category to a short editorial label. Trilingual. */
function labelForCategory(cat: string, locale: Locale): string {
  const map: Record<string, Record<Locale, string>> = {
    vegetable: { en: 'Vegetable', ar: 'خضروات', fr: 'Légume' },
    fruit: { en: 'Fruit', ar: 'فاكهة', fr: 'Fruit' },
    leaf: { en: 'Leaf', ar: 'أوراق', fr: 'Feuille' },
    specialty: { en: 'Specialty', ar: 'تخصص', fr: 'Spécialité' },
  };
  return map[cat]?.[locale] ?? cat;
}
