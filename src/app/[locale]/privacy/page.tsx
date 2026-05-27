import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { getLegalPage } from '@/lib/content';

export const dynamic = 'error';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getLegalPage('privacy', locale);
  if (!page) notFound();

  return (
    <Section spacing="lg">
      <Container width="narrow">
        <h1 className="mb-4 text-display font-bold">{page.title}</h1>
        {page.lastUpdated && (
          <p className="mb-8 text-body-sm text-text-muted">Last updated: {page.lastUpdated}</p>
        )}
        <div className="prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body}</ReactMarkdown>
        </div>
      </Container>
    </Section>
  );
}
