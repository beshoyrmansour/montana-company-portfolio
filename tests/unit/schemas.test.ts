import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { siteSchema } from '@/schemas/site';
import { productSchema } from '@/schemas/product';
import { newsArticleSchema } from '@/schemas/news';
import { homePageSchema, aboutPageSchema, contactPageSchema } from '@/schemas/page';
import { marketsSchema } from '@/schemas/markets';

const CONTENT_DIR = path.resolve(__dirname, '../../content');

async function loadJson(rel: string) {
  const raw = await fs.readFile(path.join(CONTENT_DIR, rel), 'utf-8');
  return JSON.parse(raw);
}

describe('content schema validation', () => {
  it('site.json conforms', async () => {
    const data = await loadJson('site.json');
    expect(siteSchema.safeParse(data).success).toBe(true);
  });

  it('markets.json conforms', async () => {
    const data = await loadJson('markets.json');
    expect(marketsSchema.safeParse(data).success).toBe(true);
  });

  it('pages/home.json conforms', async () => {
    const data = await loadJson('pages/home.json');
    expect(homePageSchema.safeParse(data).success).toBe(true);
  });

  it('pages/about.json conforms', async () => {
    const data = await loadJson('pages/about.json');
    expect(aboutPageSchema.safeParse(data).success).toBe(true);
  });

  it('pages/contact.json conforms', async () => {
    const data = await loadJson('pages/contact.json');
    expect(contactPageSchema.safeParse(data).success).toBe(true);
  });

  it('all products conform', async () => {
    const dir = path.join(CONTENT_DIR, 'products');
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
    expect(files.length).toBeGreaterThan(10);
    for (const f of files) {
      const data = await loadJson(`products/${f}`);
      const result = productSchema.safeParse(data);
      if (!result.success) {
        console.error(`${f} failed:`, result.error.issues);
      }
      expect(result.success).toBe(true);
    }
  });

  it('all news articles conform', async () => {
    const dir = path.join(CONTENT_DIR, 'news');
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
    for (const f of files) {
      const data = await loadJson(`news/${f}`);
      const result = newsArticleSchema.safeParse(data);
      if (!result.success) {
        console.error(`${f} failed:`, result.error.issues);
      }
      expect(result.success).toBe(true);
    }
  });
});
