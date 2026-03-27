import { test, expect, type Page } from '@playwright/test';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Run tests serially to share login session and avoid rate-limiting
test.describe.configure({ mode: 'serial' });

async function adminLogin(page: Page) {
  await page.goto('/admin/login');
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/', { timeout: 15000 });
}

async function goToServiceEdit(page: Page, rowIndex: number) {
  await page.goto('/admin/services');
  await page.waitForLoadState('networkidle');
  const editLinks = page.getByRole('link', { name: 'Edit' });
  await editLinks.nth(rowIndex).click();
  await page.waitForURL(/\/admin\/services\/[0-9a-f-]+/);
  await page.waitForLoadState('networkidle');
}

/** Enable editing, submit, and wait for success toast */
async function submitAndWaitForSuccess(page: Page) {
  await page.click('button[type="submit"]');
  await page.getByRole('alert').getByText('Service saved.').waitFor({ timeout: 10000 });
}

test.describe('Admin Service Slug Editing', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await adminLogin(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should show slug field as disabled by default and editable after toggle', async () => {
    await goToServiceEdit(page, 0);

    const slugInput = page.locator('input[name="slug"]');
    await expect(slugInput).toBeVisible();
    await expect(slugInput).toBeDisabled();

    // Click Edit to enable
    await page.locator('button', { hasText: /^Edit$/ }).click();
    await expect(slugInput).toBeEnabled();
  });

  test('should update service slug and verify persistence', async () => {
    await goToServiceEdit(page, 0);

    const slugInput = page.locator('input[name="slug"]');
    const originalSlug = await slugInput.inputValue();

    // Enable editing and change slug
    await page.locator('button', { hasText: /^Edit$/ }).click();
    const testSlug = `${originalSlug}-e2e-test`;
    await slugInput.fill(testSlug);

    await submitAndWaitForSuccess(page);

    // Reload the page to verify slug persisted
    await goToServiceEdit(page, 0);
    const updatedSlug = await page.locator('input[name="slug"]').inputValue();
    expect(updatedSlug).toBe(testSlug);

    // Restore original slug
    await page.locator('button', { hasText: /^Edit$/ }).click();
    await page.locator('input[name="slug"]').fill(originalSlug);
    await submitAndWaitForSuccess(page);
  });

  test('should reject invalid slug format', async () => {
    await goToServiceEdit(page, 0);

    await page.locator('button', { hasText: /^Edit$/ }).click();
    await page.locator('input[name="slug"]').fill('INVALID SLUG!');
    await page.click('button[type="submit"]');

    // Should still be on the edit page
    await expect(page).toHaveURL(/\/admin\/services\/[0-9a-f-]+/);

    // Error alert should be visible (scope to main content, exclude route announcer)
    const errorAlert = page.getByRole('main').locator('[role="alert"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(errorAlert).toContainText(/slug/i);
  });

  test('should handle slug collision by auto-appending suffix', async () => {
    // Get the first service's slug
    await goToServiceEdit(page, 0);
    const firstSlug = await page.locator('input[name="slug"]').inputValue();

    // Go to the second service
    await goToServiceEdit(page, 1);
    const originalSecondSlug = await page.locator('input[name="slug"]').inputValue();

    // Set to first service's slug (collision)
    await page.locator('button', { hasText: /^Edit$/ }).click();
    await page.locator('input[name="slug"]').fill(firstSlug);
    await submitAndWaitForSuccess(page);

    // Reload second service — slug should be firstSlug-2
    await goToServiceEdit(page, 1);
    const collisionSlug = await page.locator('input[name="slug"]').inputValue();
    expect(collisionSlug).toBe(`${firstSlug}-2`);

    // Restore original slug
    await page.locator('button', { hasText: /^Edit$/ }).click();
    await page.locator('input[name="slug"]').fill(originalSecondSlug);
    await submitAndWaitForSuccess(page);
  });
});
