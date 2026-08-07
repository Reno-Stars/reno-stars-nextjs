import { test, expect } from '@playwright/test';

const PATH = '/en/site-visit-checklist/';

test.describe('site visit checklist', () => {
  test('renders and stays out of the index', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Site Visit Checklist');

    // This is an internal ops tool — it must never be indexable.
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/);

    // Universal checks show before any scope is picked.
    await expect(page.getByText('Before you start')).toBeVisible();
    await expect(page.getByText('Site conditions')).toBeVisible();
  });

  test('picking a scope reveals only that scope’s checks', async ({ page }) => {
    await page.goto(PATH);

    // No scope yet — the empty state stands in for the scope checks.
    await expect(page.getByText('Pick a scope above')).toBeVisible();

    await page.getByRole('button', { name: 'Bathroom', exact: true }).click();
    await page.getByRole('combobox').selectOption('bathroom-4piece');

    await expect(page.getByText('Pick a scope above')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Vanity', exact: true })).toBeVisible();
    // Kitchen cabinets belong to a scope that wasn't picked.
    await expect(page.getByRole('heading', { name: 'Kitchen cabinets' })).toBeHidden();
  });

  test('an add-on adds its checks and the URL carries the scope', async ({ page }) => {
    await page.goto(PATH);
    await page.getByRole('button', { name: 'Bathroom', exact: true }).click();
    await page.getByRole('combobox').selectOption('bathroom-4piece');

    await expect(page.getByRole('heading', { name: 'Potlights' })).toBeHidden();
    await page.getByLabel('Potlights').check();
    await expect(page.getByRole('heading', { name: 'Potlights' })).toBeVisible();

    await expect(page).toHaveURL(/bathrooms=bathroom-4piece%2Cbathroom-potlights/);
  });

  test('a shared link opens already configured', async ({ page }) => {
    await page.goto(`${PATH}?bathrooms=bathroom-4piece,bathroom-niche`);
    await expect(page.getByRole('heading', { name: 'Shower niche' })).toBeVisible();
    await expect(page.getByLabel('Shower niche')).toBeChecked();
  });

  test('ticks survive a reload', async ({ page }) => {
    await page.goto(PATH);
    const first = page.getByText("Confirm the client's name and the full address you're standing at");
    await first.click();

    await page.reload();
    await expect(page.getByText('1 of', { exact: false })).toBeVisible();
  });
});
