import { z } from 'zod';
import { i18nString, slug } from './shared';

export const newsCategory = z.enum([
  'corporate',
  'product',
  'market',
  'sustainability',
  'press',
]);

export const newsArticleSchema = z.object({
  slug: slug,
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: newsCategory,
  featured: z.boolean(),
  title: i18nString,
  excerpt: i18nString,
  body: z.object({
    en: z.string().min(1),
    ar: z.string().optional(),
    fr: z.string().optional(),
  }),
  author: z.string(),
  coverImage: z.string(),
  tags: z.array(z.string()),
  seo: z
    .object({
      title: i18nString.optional(),
      description: i18nString.optional(),
    })
    .optional(),
});

export type NewsArticle = z.infer<typeof newsArticleSchema>;
