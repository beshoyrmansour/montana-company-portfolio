import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/contact/route';

const inquiry = {
  name: 'Test Visitor',
  email: 'visitor@example.com',
  company: 'Test Company',
  country: 'Egypt',
  reason: 'sample',
  subject: 'sales',
  message: 'Please share the sample options.',
  consent: true,
};

function submit(body: unknown) {
  return POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

describe('contact inquiry delivery', () => {
  const provider = vi.fn<typeof fetch>();

  beforeEach(() => {
    provider.mockReset();
    vi.stubGlobal('fetch', provider);
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'site@example.com');
    vi.stubEnv('CONTACT_TO_EMAIL', 'sales@example.com');
    vi.stubEnv('TURNSTILE_SECRET', '');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sends the inquiry details and confirms only after acceptance', async () => {
    provider.mockResolvedValueOnce(Response.json({ id: 'test-id' }));
    const res = await submit(inquiry);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(provider).toHaveBeenCalledOnce();
    const [url, init] = provider.mock.calls[0]!;
    expect(url).toBe('https://api.resend.com/emails');
    const mail = JSON.parse(String(init?.body));
    expect(mail.reply_to).toBe(inquiry.email);
    expect(mail.to).toBe('sales@example.com');
    expect(mail.html).toContain('Destination country:</strong> Egypt');
    expect(mail.html).toContain('Inquiry reason:</strong> sample');
    expect(mail.html).toContain(inquiry.message);
  });

  it('rejects an inquiry without consent before contacting the provider', async () => {
    const res = await submit({ ...inquiry, consent: false });
    expect(res.status).toBe(400);
    expect(provider).not.toHaveBeenCalled();
  });

  it('returns an error when the mail service is not configured', async () => {
    vi.stubEnv('CONTACT_TO_EMAIL', '');
    const res = await submit(inquiry);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'mail_unavailable' });
    expect(provider).not.toHaveBeenCalled();
  });

  it('returns an error when the provider rejects the message or cannot be reached', async () => {
    provider.mockResolvedValueOnce(new Response(null, { status: 429 }));
    provider.mockRejectedValueOnce(new TypeError('network error'));
    for (let i = 0; i < 2; i++) {
      const res = await submit(inquiry);
      expect(res.status).toBe(502);
      expect(await res.json()).toEqual({ error: 'mail_failed' });
    }
  });
});
