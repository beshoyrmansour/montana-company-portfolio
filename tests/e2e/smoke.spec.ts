import { test, expect } from '@playwright/test';

test.describe('smoke tests (static build)', () => {
  test('root path redirects to a locale based on Accept-Language', async ({ page }) => {
    // Default Playwright Accept-Language is en-US,en — should land on /en.
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(/\/en($|\/)/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('A Quality Lifestyle');
  });

  test('root path falls back to default when Accept-Language is unsupported', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'de-DE' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en($|\/)/);
    await ctx.close();
  });

  test('root path honors French Accept-Language', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'fr-FR' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/fr($|\/)/);
    await ctx.close();
  });

  test('English homepage loads with brand content', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle(/Montana/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('A Quality Lifestyle');
    // Stats strip
    await expect(page.getByText('40+').first()).toBeVisible();
    await expect(page.getByText('70').first()).toBeVisible();
  });

  test('Arabic homepage loads with RTL', async ({ page }) => {
    await page.goto('/ar');
    // The inline script sets dir; wait for it to run
    await page.waitForFunction(() => document.documentElement.dir === 'rtl');
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('French homepage loads with French copy', async ({ page }) => {
    await page.goto('/fr');
    await expect(page.locator('h1')).toContainText(/qualité|style de vie/i);
  });

  test('Catalog index lists all products', async ({ page }) => {
    await page.goto('/en/catalog');
    await expect(page.getByRole('heading', { name: /products/i, level: 1 })).toBeVisible();
    // ProductCard renders h3 for each product
    const cards = page.locator('h3');
    expect(await cards.count()).toBeGreaterThanOrEqual(16);
  });

  test('Product detail page renders Molokhia', async ({ page }) => {
    await page.goto('/en/catalog/molokhia');
    await expect(page.getByRole('heading', { name: 'Molokhia', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /request product information/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /email us directly/i })).toBeVisible();
  });

  test('Arabic product detail mirrors RTL', async ({ page }) => {
    await page.goto('/ar/catalog/molokhia');
    await page.waitForFunction(() => document.documentElement.dir === 'rtl');
    await expect(page.getByRole('heading', { name: 'ملوخية', level: 1 })).toBeVisible();
  });

  test('News index page renders', async ({ page }) => {
    await page.goto('/en/news');
    await expect(page.getByRole('heading', { name: /newsroom/i, level: 1 })).toBeVisible();
    // Three articles seeded
    const articles = page.locator('article, a').filter({ hasText: /haccp|kalioub|molokhia/i });
    expect(await articles.count()).toBeGreaterThanOrEqual(3);
  });

  test('Contact page has form with required fields', async ({ page }) => {
    await page.goto('/en/contact');
    // Labels include a required "*" — match by name attribute instead
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('select[name="subject"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible();
    // Honeypot must be present + visually offscreen + aria-hidden
    const honeypot = page.locator('input[name="website"]');
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
    await expect(honeypot.locator('xpath=..')).toHaveAttribute('aria-hidden', 'true');
  });

  test('Markets page lists regions', async ({ page }) => {
    await page.goto('/en/markets');
    await expect(page.getByRole('heading', { name: /our markets/i, level: 1 })).toBeVisible();
    // 4 regions seeded
    const regions = page.getByRole('heading', { level: 2 });
    expect(await regions.count()).toBeGreaterThanOrEqual(4);
  });

  test('Sitemap is generated', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('montanaeg.com');
    expect(xml).toContain('/en/catalog/molokhia');
    expect(xml).toContain('/ar/catalog/molokhia');
  });

  test('Organization JSON-LD on every page', async ({ page }) => {
    await page.goto('/en');
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toContain('"@type":"Organization"');
    expect(jsonLd).toContain('"name":"Montana"');
  });

  test('404 page renders for unknown routes', async ({ request }) => {
    const res = await request.get('/this-route-does-not-exist', { failOnStatusCode: false });
    expect(res.status()).toBe(404);
  });
});
