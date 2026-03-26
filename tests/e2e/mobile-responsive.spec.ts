import { test, expect, type Page } from '@playwright/test';

const VIEWPORTS = [
  { name: 'iPhone SE', width: 320, height: 568 },
  { name: 'iPhone 12', width: 375, height: 812 },
];

const PAGES = [
  { path: '/en', label: 'Homepage' },
  { path: '/en/projects', label: 'Projects' },
  { path: '/en/contact', label: 'Contact' },
  { path: '/en/workflow', label: 'Workflow' },
  { path: '/en/blog', label: 'Blog' },
];

async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  });
}

for (const viewport of VIEWPORTS) {
  test.describe(`Mobile responsive — ${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const pg of PAGES) {
      test(`${pg.label} has no horizontal overflow`, async ({ page }) => {
        await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
        const noOverflow = await hasNoHorizontalOverflow(page);
        expect(noOverflow).toBe(true);
      });
    }

    test('contact form inputs fit within viewport', async ({ page }) => {
      await page.goto('/en/contact', { waitUntil: 'domcontentloaded' });

      const inputs = page.locator('form input, form textarea, form select');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const box = await inputs.nth(i).boundingBox();
        if (box) {
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
        }
      }
    });
  });
}
