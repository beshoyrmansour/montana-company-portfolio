import { z } from 'zod';
import { i18nString } from './shared';

export const siteSchema = z.object({
  brand: z.object({
    name: i18nString,
    tagline: i18nString,
    logoUrl: z.string(),
    logoMarkUrl: z.string(),
  }),
  founded: z.number().int(),
  parentCompany: i18nString,
  parentSince: z.number().int(),
  stats: z.array(
    z.object({
      label: i18nString,
      value: z.string(),
      /** lucide-react icon name — e.g. 'Calendar', 'Factory', 'Users', 'Globe' */
      icon: z.string().optional(),
    }),
  ),
  contact: z.object({
    office: z.object({
      label: i18nString,
      address: i18nString,
      phones: z.array(z.string()),
      fax: z.string().optional(),
      email: z.string().email(),
    }),
    factory: z.object({
      label: i18nString,
      address: i18nString,
      phones: z.array(z.string()),
      fax: z.string().optional(),
      email: z.string().email(),
      coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }),
  }),
  social: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    youtube: z.string().url().optional(),
  }),
  certifications: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      logoUrl: z.string().optional(),
    }),
  ),
});

export type Site = z.infer<typeof siteSchema>;
