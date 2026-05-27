'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/schemas/product';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/cn';

interface CategoryFilterProps {
  products: Product[];
  locale: Locale;
  labels: {
    all: string;
    vegetable: string;
    fruit: string;
    leaf: string;
    specialty: string;
  };
}

type Category = 'all' | 'vegetable' | 'fruit' | 'leaf' | 'specialty';

/**
 * Filter pills + grid. Client-side filtering for instant UX
 * (16 products = no need for URL state or server fetch).
 */
export function CategoryFilter({ products, locale, labels }: CategoryFilterProps) {
  const [active, setActive] = useState<Category>('all');

  const filtered = useMemo(
    () => (active === 'all' ? products : products.filter((p) => p.category === active)),
    [products, active],
  );

  const categories: { key: Category; label: string; count: number }[] = [
    { key: 'all', label: labels.all, count: products.length },
    {
      key: 'vegetable',
      label: labels.vegetable,
      count: products.filter((p) => p.category === 'vegetable').length,
    },
    {
      key: 'fruit',
      label: labels.fruit,
      count: products.filter((p) => p.category === 'fruit').length,
    },
    {
      key: 'leaf',
      label: labels.leaf,
      count: products.filter((p) => p.category === 'leaf').length,
    },
    {
      key: 'specialty',
      label: labels.specialty,
      count: products.filter((p) => p.category === 'specialty').length,
    },
  ];

  return (
    <>
      {/*
        Filter pills.
        Mobile: single horizontal scroll row with edge-bleed (-mx-4 px-4
        cancels Container's px-4 so pills can scroll right up to the viewport
        edge — feels native, signals scrollability via partial pill at the edge).
        sm+: wrap normally.
      */}
      <div
        className={cn(
          'mb-10 flex items-center gap-2',
          '-mx-4 overflow-x-auto px-4 pb-2',
          'sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0',
        )}
      >
        {categories.map((cat) => {
          if (cat.count === 0 && cat.key !== 'all') return null;
          const isActive = active === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActive(cat.key)}
              aria-pressed={isActive}
              className={cn(
                'text-body-sm inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2 font-semibold tracking-wider uppercase transition-colors',
                isActive
                  ? 'border-brand-primary bg-brand-primary text-brand-primary-fg'
                  : 'border-border bg-surface text-text-muted hover:border-brand-primary hover:text-brand-primary',
              )}
            >
              {cat.label}
              <span
                className={cn(
                  'text-caption rounded-full px-2 py-0.5',
                  isActive ? 'bg-white/20' : 'bg-surface-muted',
                )}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product, idx) => (
          <ProductCard key={product.slug} product={product} locale={locale} priority={idx < 4} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-body-lg text-text-muted text-center">No products in this category.</p>
      )}
    </>
  );
}
