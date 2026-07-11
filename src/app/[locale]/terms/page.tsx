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
  const page = await getLegalPage('terms', locale);
  return buildPageMetadata({
    locale,
    path: '/terms',
    title: page?.title ?? 'Terms of Use',
    description:
      'The terms governing use of the Montana Frozen Foods website and the conditions for B2B inquiries, quotes, and export communications.',
    ogImage: `/${locale}/opengraph-image`,
    noindex: true,
  });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getLegalPage('terms', locale);
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
