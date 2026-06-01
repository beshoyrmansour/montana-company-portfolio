import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronRight, Calendar, User } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { ShareButtons } from '@/components/sections/ShareButtons';
import { getAvailableLocales, pick, type Locale } from '@/lib/i18n';
import { getAllNewsSlugs, getNewsArticle, getSite, getAllNewsArticles } from '@/lib/content';
import { JsonLd } from '@/components/seo/JsonLd';
import { newsArticleJsonLd, breadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';

export const dynamic = 'error';
export const dynamicParams = false;

export async function generateStaticParams() {
  const locales = getAvailableLocales();
  const slugs = await getAllNewsSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const article = await getNewsArticle(slug);
  if (!article) return {};
  const title = pick(article.seo?.title, locale) ?? pick(article.title, locale) ?? article.slug;
  const description = pick(article.seo?.description, locale) ?? pick(article.excerpt, locale) ?? '';
  return buildPageMetadata({
    locale,
    path: `/news/${article.slug}`,
    title,
    description,
    keywords: article.tags,
    ogImage: article.coverImage,
    ogType: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt ?? article.publishedAt,
    authors: [article.author],
    section: article.category,
    tags: article.tags,
  });
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://montanaeg.com').replace(/\/$/, '');

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [article, site, allArticles] = await Promise.all([
    getNewsArticle(slug),
    getSite(),
    getAllNewsArticles(),
  ]);
  if (!article) notFound();

  const body = pick(article.body, locale as Locale) ?? '';
  const siteName = pick(site.brand.name, locale as Locale) ?? 'Montana';
  const title = pick(article.title, locale as Locale) ?? article.slug;
  const articleUrl = `${SITE_URL}/${locale}/news/${article.slug}`;

  // Related: same category, exclude current, max 3
  const related = allArticles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 3);

  const dateFormatted = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  const tHomeLabel = locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home';
  const tNewsLabel = locale === 'ar' ? 'الأخبار' : locale === 'fr' ? 'Actualités' : 'News';
  const tShareLabel = locale === 'ar' ? 'شارك:' : locale === 'fr' ? 'Partager :' : 'Share:';
  const tRelatedLabel =
    locale === 'ar'
      ? 'مقالات ذات صلة'
      : locale === 'fr'
        ? 'Articles similaires'
        : 'Related articles';

  return (
    <article>
      <JsonLd
        data={[
          newsArticleJsonLd(article, locale as Locale, siteName),
          breadcrumbJsonLd([
            { name: tHomeLabel, href: `/${locale}` },
            { name: tNewsLabel, href: `/${locale}/news` },
            { name: title, href: `/${locale}/news/${article.slug}` },
          ]),
        ]}
      />

      {/* ─── HERO with cover image + scrim ─── */}
      <section className="relative isolate overflow-hidden">
        {article.coverImage && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={article.coverImage}
              alt=""
              fill
              sizes="100vw"
              className="h-full w-full object-cover"
              priority
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"
              aria-hidden
            />
          </div>
        )}
        <Container className="relative py-20 lg:py-28">
          <nav
            aria-label="Breadcrumb"
            className="text-body-sm mb-6 flex items-center gap-1 text-white/85"
          >
            <Link href={`/${locale}`} className="hover:underline">
              {tHomeLabel}
            </Link>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            <Link href={`/${locale}/news`} className="hover:underline">
              {tNewsLabel}
            </Link>
          </nav>

          <p className="bg-brand-primary text-caption text-brand-primary-fg mb-4 inline-block rounded-full px-4 py-1.5 font-semibold tracking-wider uppercase">
            {article.category}
          </p>
          <h1 className="text-display-xl mb-6 max-w-4xl leading-[1.1] font-bold text-white drop-shadow-sm">
            {title}
          </h1>
          <div className="text-body-sm flex flex-wrap items-center gap-x-6 gap-y-2 text-white/90">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" aria-hidden />
              <time dateTime={article.publishedAt}>{dateFormatted}</time>
            </span>
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" aria-hidden />
              {article.author}
            </span>
          </div>
        </Container>
      </section>

      {/* ─── EXCERPT lead paragraph ─── */}
      <Section spacing="md">
        <Container width="narrow">
          <p className="text-body-lg text-text leading-relaxed font-medium">
            {pick(article.excerpt, locale as Locale)}
          </p>
        </Container>
      </Section>

      {/* ─── BODY ─── */}
      <Section spacing="md">
        <Container width="narrow">
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
          </div>
        </Container>
      </Section>

      {/* ─── SHARE + TAGS ─── */}
      <Section spacing="md" background="muted">
        <Container width="narrow">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <ShareButtons url={articleUrl} title={title} label={tShareLabel} />
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-surface text-caption text-text-muted rounded-full px-3 py-1 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* ─── RELATED ARTICLES ─── */}
      {related.length > 0 && (
        <Section spacing="lg">
          <Container>
            <h2 className="text-display mb-8 font-bold">{tRelatedLabel}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/${locale}/news/${rel.slug}`}
                  className="group border-border bg-surface block overflow-hidden rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={rel.coverImage}
                      alt={pick(rel.title, locale as Locale) ?? ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 p-5">
                    <p className="text-caption text-brand-primary font-semibold tracking-wider uppercase">
                      {rel.category}
                    </p>
                    <h3 className="text-heading-3 group-hover:text-brand-primary font-semibold transition-colors">
                      {pick(rel.title, locale as Locale)}
                    </h3>
                    <p className="text-body-sm text-text-muted line-clamp-2">
                      {pick(rel.excerpt, locale as Locale)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </article>
  );
}
