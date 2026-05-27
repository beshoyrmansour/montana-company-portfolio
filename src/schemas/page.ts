import { z } from 'zod';
import { i18nString, slug } from './shared';

/* ─────────────────────────────────────────────────────────────────
 * Shared editorial primitives.
 *
 * A "split title" is the editorial pattern: regular text + italic
 * emphasis (e.g. "The story, <em>in chapters.</em>").
 * A "split headline" adds a trailing tail for hero compositions
 * (e.g. "A family, <em>a delta,</em> four decades.").
 * ───────────────────────────────────────────────────────────────── */

/**
 * Optional per-page SEO override. When present, fields here take
 * precedence over the auto-derived defaults (hero text + brand boilerplate)
 * inside generateMetadata. Image path is root-relative (e.g. /images/og/about.jpg).
 */
const seoOverride = z
  .object({
    title: i18nString.optional(),
    description: i18nString.optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
  })
  .optional();

const splitTitle = z.object({
  lead: i18nString,
  em: i18nString,
});

const splitHeadline = z.object({
  lead: i18nString,
  em: i18nString,
  tail: i18nString.optional(),
});

const ctaLink = z.object({
  label: i18nString,
  href: z.string(),
  variant: z.enum(['primary', 'ghost', 'on-dark-ghost']).optional(),
  icon: z.string().optional(),
  external: z.boolean().optional(),
});

const statItem = z.object({
  num: z.string(),
  sup: z.string().optional(),
  label: i18nString,
});

/* ═════════════════════════════════════════════════════════════════
 * HOME PAGE
 * ═════════════════════════════════════════════════════════════════ */

export const homePageSchema = z.object({
  seo: seoOverride,
  hero: z.object({
    eyebrow: i18nString.optional(),
    headline: i18nString,
    subheadline: i18nString.optional(),
    pre: i18nString.optional(),
    ctaPrimary: ctaLink,
    ctaSecondary: ctaLink.optional(),
    image: z.string(),
    meta: z
      .object({
        enabled: z.boolean(),
        items: z.array(
          z.object({
            num: z.string(),
            label: i18nString,
          }),
        ),
      })
      .optional(),
  }),
  heritage: z
    .object({
      enabled: z.boolean(),
      lede: z.object({
        before: i18nString,
        strong: i18nString,
        after: i18nString,
      }),
    })
    .optional(),
  featuredProducts: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString.optional(),
    title: splitTitle,
    viewAllLabel: i18nString.optional(),
    count: z.number().int().min(1).max(12).optional(),
  }),
  chairmanQuote: z
    .object({
      enabled: z.boolean(),
      eyebrow: i18nString,
      quote: z.object({
        before: i18nString,
        strong: i18nString,
        after: i18nString,
      }),
      attribution: z.object({
        name: i18nString,
        role: i18nString,
      }),
      image: z.string().optional(),
      cornerMark: i18nString.optional(),
    })
    .optional(),
  process: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString.optional(),
    title: splitTitle,
    steps: z
      .array(
        z.object({
          label: i18nString,
          description: i18nString,
          icon: z.string(),
        }),
      )
      .length(5),
  }),
  marketsTeaser: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString.optional(),
    bigNum: z.string().optional(),
    title: i18nString,
    body: i18nString,
    chips: z.array(z.string()).optional(),
    chipsMoreLabel: i18nString.optional(),
    ctaLabel: i18nString.optional(),
  }),
  latestNews: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString.optional(),
    title: splitTitle,
    viewAllLabel: i18nString.optional(),
    count: z.number().int().min(1).max(6),
  }),
  ctaBand: z
    .object({
      enabled: z.boolean(),
      eyebrow: i18nString,
      title: splitTitle,
      body: i18nString,
      ctas: z.array(ctaLink),
    })
    .optional(),
});

export type HomePage = z.infer<typeof homePageSchema>;

/* ═════════════════════════════════════════════════════════════════
 * ABOUT PAGE
 * ═════════════════════════════════════════════════════════════════ */

export const aboutPageSchema = z.object({
  seo: seoOverride,
  hero: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    headline: splitHeadline,
    subtitle: i18nString,
    stats: z.array(statItem),
  }),
  timeline: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    items: z.array(
      z.object({
        year: z.string(),
        title: i18nString,
        description: i18nString,
        image: z.string().optional(),
        visible: z.boolean().optional(),
      }),
    ),
  }),
  chairmanQuote: z
    .object({
      enabled: z.boolean(),
      eyebrow: i18nString,
      quote: z.object({
        before: i18nString,
        strong: i18nString,
        after: i18nString,
      }),
      attribution: z.object({
        name: i18nString,
        role: i18nString,
      }),
      image: z.string().optional(),
      cornerMark: i18nString.optional(),
    })
    .optional(),
  values: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    items: z.array(
      z.object({
        num: z.string(),
        title: i18nString,
        description: i18nString,
      }),
    ),
  }),
  certifications: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    items: z.array(
      z.object({
        name: z.string(),
        description: i18nString,
      }),
    ),
  }),
});

export type AboutPage = z.infer<typeof aboutPageSchema>;

/* ═════════════════════════════════════════════════════════════════
 * CATALOG PAGE
 * ═════════════════════════════════════════════════════════════════ */

export const catalogPageSchema = z.object({
  seo: seoOverride,
  hero: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: i18nString,
    titleEm: i18nString,
    subtitle: i18nString,
    ctaDownloadLabel: i18nString.optional(),
    ctaContactLabel: i18nString,
    ctaContactHref: z.string(),
    catalogueHref: z.string(),
  }),
  signatures: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    slugs: z.array(slug),
  }),
  catalog: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    /** lead text — use ${count} placeholder for product count. */
    titleTemplate: i18nString,
    titleEm: i18nString,
    filters: z.object({
      all: i18nString,
      vegetable: i18nString,
      fruit: i18nString,
      leaf: i18nString,
      specialty: i18nString,
    }),
  }),
  harvestCalendar: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    intro: i18nString,
  }),
  ctaBand: z
    .object({
      enabled: z.boolean(),
      eyebrow: i18nString,
      title: splitHeadline,
      body: i18nString,
      ctas: z.array(ctaLink),
    })
    .optional(),
});

export type CatalogPage = z.infer<typeof catalogPageSchema>;

/* ═════════════════════════════════════════════════════════════════
 * CONTACT PAGE
 * ═════════════════════════════════════════════════════════════════ */

export const contactPageSchema = z.object({
  seo: seoOverride,
  hero: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    headline: splitTitle,
    subtitle: i18nString,
  }),
  form: z.object({
    enabled: z.boolean(),
    reasonLabel: i18nString,
    reasons: z.array(
      z.object({
        id: z.string(),
        label: i18nString,
      }),
    ),
    fields: z.object({
      name: z.object({ label: i18nString, placeholder: i18nString }),
      company: z.object({ label: i18nString, placeholder: i18nString }),
      email: z.object({ label: i18nString, placeholder: z.string() }),
      country: z.object({ label: i18nString, placeholder: i18nString }),
      message: z.object({ label: i18nString, placeholder: i18nString }),
    }),
    note: i18nString,
    submit: i18nString,
    successTitle: i18nString,
    successBody: i18nString,
    sendAnother: i18nString,
    telLabel: i18nString,
    emailLabel: i18nString,
    hoursLabel: i18nString,
  }),
  offices: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    items: z.array(
      z.object({
        city: i18nString,
        country: i18nString,
        address: i18nString,
        tel: z.string(),
        email: z.string(),
        role: i18nString,
        hours: i18nString,
        visible: z.boolean().optional(),
      }),
    ),
  }),
  map: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    body: i18nString,
    actions: z.array(ctaLink),
    /** SVG label positions — geometry kept in tsx because they are tied
     *  to viewBox coordinates, only the strings move to JSON. */
    svgLabels: z.object({
      hq: i18nString,
      hqSub: i18nString,
      cairo: i18nString,
      alexandria: i18nString,
    }),
  }),
  faq: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    items: z.array(
      z.object({
        q: i18nString,
        a: i18nString,
        visible: z.boolean().optional(),
      }),
    ),
  }),
});

export type ContactPage = z.infer<typeof contactPageSchema>;

/* ═════════════════════════════════════════════════════════════════
 * NEWS PAGE
 * ═════════════════════════════════════════════════════════════════ */

export const newsPageSchema = z.object({
  seo: seoOverride,
  hero: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    headline: splitTitle,
    subtitle: i18nString,
  }),
  list: z.object({
    enabled: z.boolean(),
    emptyMessage: i18nString,
    allLabel: i18nString,
    featuredLabel: i18nString,
    readMinSuffix: i18nString,
    readMoreLabel: i18nString,
    categories: z.array(
      z.object({
        id: z.enum(['corporate', 'product', 'market', 'sustainability', 'press']),
        label: i18nString,
      }),
    ),
  }),
  newsletter: z
    .object({
      enabled: z.boolean(),
      eyebrow: i18nString,
      title: splitTitle,
      body: i18nString,
      placeholder: z.string(),
      submitLabel: i18nString,
      successMessage: i18nString,
    })
    .optional(),
});

export type NewsPage = z.infer<typeof newsPageSchema>;

/* ═════════════════════════════════════════════════════════════════
 * MARKETS PAGE
 * ═════════════════════════════════════════════════════════════════ */

export const marketsPageSchema = z.object({
  seo: seoOverride,
  hero: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    headline: splitHeadline,
    /** body uses ${count} for total country count placeholder. */
    body: i18nString,
    stats: z.array(statItem),
  }),
  atlas: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    hint: i18nString,
    labels: z.object({
      allMarkets: i18nString,
      hoverHint: i18nString,
      egyptLabel: i18nString,
      portLabel: i18nString,
    }),
  }),
  regionSpotlights: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    countriesLabel: i18nString,
    focusLabelTemplate: i18nString,
  }),
  directory: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitHeadline,
    /** note uses ${count} placeholder. */
    note: i18nString,
  }),
  logistics: z.object({
    enabled: z.boolean(),
    eyebrow: i18nString,
    title: splitTitle,
    body: i18nString,
    steps: z.array(
      z.object({
        num: z.string(),
        label: i18nString,
        description: i18nString,
        sub: i18nString,
      }),
    ),
  }),
  ctaBand: z
    .object({
      enabled: z.boolean(),
      eyebrow: i18nString,
      title: splitTitle,
      body: i18nString,
      ctas: z.array(ctaLink),
    })
    .optional(),
});

export type MarketsPage = z.infer<typeof marketsPageSchema>;
