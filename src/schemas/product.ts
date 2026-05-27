import { z } from 'zod';
import { i18nString, slug } from './shared';

export const productCategory = z.enum(['vegetable', 'fruit', 'leaf', 'specialty']);
export const productBadge = z.enum([
  'popular',
  'seasonal',
  'new',
  'signature',
  'export-only',
  'organic',
]);
export const seasonMonth = z.enum([
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
]);
export const packagingType = z.enum(['retail', 'foodservice', 'bulk']);

export const productSchema = z.object({
  slug: slug,
  name: i18nString,
  shortDescription: i18nString,
  description: i18nString,
  category: productCategory,
  featured: z.boolean(),
  badges: z.array(productBadge),
  varieties: z.array(
    z.object({
      name: i18nString,
      sizes: z
        .array(
          z.object({
            label: i18nString,
            spec: i18nString,
          }),
        )
        .optional(),
    }),
  ),
  packaging: z.array(
    z.object({
      sku: z.string().optional(),
      type: packagingType,
      weight: z.string(),
      perCarton: z.string(),
    }),
  ),
  seasonality: z.array(seasonMonth),
  images: z.object({
    primary: z.string(),
    gallery: z.array(z.string()),
    packaging: z.array(z.string()),
  }),
  nutrition: i18nString.optional(),
  preparation: i18nString.optional(),
  relatedSlugs: z.array(slug),
  seo: z
    .object({
      title: i18nString.optional(),
      description: i18nString.optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

export type Product = z.infer<typeof productSchema>;
export type ProductBadge = z.infer<typeof productBadge>;
