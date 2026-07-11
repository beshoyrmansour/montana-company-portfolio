import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { getLegalPage } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/i18n';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const page = await getLegalPage('privacy', locale);
  return buildPageMetadata({
    locale,
    path: '/privacy',
    title: page?.title ?? 'Privacy Policy',
    description:
      'How Montana Frozen Foods collects, uses, and protects the personal data of buyers and visitors across our B2B export platform.',
    ogImage: `/${locale}/opengraph-image`,
    noindex: true,
  });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getLegalPage('privacy', locale);
  if (!page) notFound();

  return (
    <Section spacing="lg">
      <Container width="narrow">
        <h1 className="text-display mb-4 font-bold">{page.title}</h1>
        {page.lastUpdated && (
          <p className="text-body-sm text-text-muted mb-8">Last updated: {page.lastUpdated}</p>
        )}
        <div className="prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body}</ReactMarkdown>
        </div>
      </Container>
    </Section>
  );
}
