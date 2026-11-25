import { expect, test } from '@playwright/test';

const pages = [
  { path: '/en', grid: '.cert-wall' },
  { path: '/en/about', grid: '.cert-grid' },
];

const layouts = [
  { width: 390, columns: 1 },
  { width: 768, columns: 2 },
  { width: 1024, columns: 2 },
  { width: 1440, columns: 4 },
];

for (const { path, grid } of pages) {
  test(`certificate cards on ${path} reflow from one to two to four columns`, async ({ page }) => {
    await page.goto(path);
    const cards = page.locator(grid).locator(':scope > *');
    await expect(cards).toHaveCount(4);

    for (const { width, columns } of layouts) {
      await page.setViewportSize({ width, height: 900 });
      const rows = await cards.evaluateAll((elements) => {
        const counts = new Map<number, number>();
        for (const card of elements) {
          const top = Math.round(card.getBoundingClientRect().top);
          counts.set(top, (counts.get(top) ?? 0) + 1);
        }
        return [...counts.values()];
      });
      expect(rows, `rows at ${width}px`).toEqual(Array<number>(4 / columns).fill(columns));
    }
  });
}
