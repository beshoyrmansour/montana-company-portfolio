import { z } from 'zod';
import { i18nString } from './shared';

export const marketsSchema = z.object({
  regions: z.array(
    z.object({
      id: z.string(),
      name: i18nString,
      /** Hex colour for region accents. Falls back to brand primary. */
      color: z.string().optional(),
      /** Lead time string shown on region cards (e.g. "4–10 days"). */
      leadTime: z.string().optional(),
      /** Editorial lede for the region spotlight card. */
      lede: i18nString.optional(),
      /** Hero/spotlight image for the region card. */
      photo: z.string().optional(),
      countries: z.array(
        z.object({
          iso: z.string().length(2),
          name: i18nString,
          since: z.number().int().optional(),
          distributor: z.string().optional(),
        }),
      ),
    }),
  ),
});

export type Markets = z.infer<typeof marketsSchema>;
