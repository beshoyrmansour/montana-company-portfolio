import { z } from 'zod';

/**
 * An i18n string with required English + optional Arabic + French.
 * Used in every content file where text needs translation.
 */
export const i18nString = z.object({
  en: z.string().min(1),
  ar: z.string().optional(),
  fr: z.string().optional(),
});

export type I18nString = z.infer<typeof i18nString>;

/** Slug — lowercase letters, numbers, hyphens only. */
export const slug = z.string().regex(/^[a-z0-9-]+$/, 'must be kebab-case');

/** Image path — must start with / */
export const imagePath = z.string().regex(/^\/.+\.(png|jpg|jpeg|webp|avif|svg)$/i, 'must be a valid local image path');
