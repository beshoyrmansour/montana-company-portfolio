import type { Metadata } from 'next';

export const dynamic = 'error';

export const metadata: Metadata = {
  title: '404 — This shipment didn’t arrive',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <iframe
      src="/404.html"
      title="404 — This shipment didn’t arrive"
      className="fixed inset-0 h-screen w-screen border-0"
    />
  );
}
