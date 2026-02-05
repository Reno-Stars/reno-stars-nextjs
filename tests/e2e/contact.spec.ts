import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/contact');
  });

  test('should load contact page', async ({ page }) => {
    await expect(page).toHaveURL(/contact/);
  });

  test('should display contact form', async ({ page }) => {
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should have required form fields', async ({ page }) => {
    // Name field
    const nameField = page.locator(
      'input[name="name"], input[placeholder*="name" i]'
    );
    await expect(nameField).toBeVisible();

    // Email field
    const emailField = page.locator(
      'input[name="email"], input[type="email"], input[placeholder*="email" i]'
    );
    await expect(emailField).toBeVisible();

    // Message field
    const messageField = page.locator(
      'textarea[name="message"], textarea[placeholder*="message" i]'
    );
    await expect(messageField).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    const submitButton = page.locator(
      'button[type="submit"], input[type="submit"]'
    );
    await submitButton.click();

    // Check for HTML5 validation or custom error messages
    const nameField = page.locator(
      'input[name="name"], input[placeholder*="name" i]'
    );
    const isInvalid = await nameField.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isInvalid).toBe(true);
  });

  test('should accept valid input', async ({ page }) => {
    // Fill in the form
    await page
      .locator('input[name="name"], input[placeholder*="name" i]')
      .fill('John Doe');
    await page
      .locator(
        'input[name="email"], input[type="email"], input[placeholder*="email" i]'
      )
      .fill('john@example.com');

    const phoneField = page.locator(
      'input[name="phone"], input[type="tel"], input[placeholder*="phone" i]'
    );
    if (await phoneField.isVisible()) {
      await phoneField.fill('(604) 555-0123');
    }

    await page
      .locator('textarea[name="message"], textarea[placeholder*="message" i]')
      .fill('I would like to inquire about kitchen renovation services.');

    // Verify fields are filled
    await expect(
      page.locator('input[name="name"], input[placeholder*="name" i]')
    ).toHaveValue('John Doe');
    await expect(
      page.locator(
        'input[name="email"], input[type="email"], input[placeholder*="email" i]'
      )
    ).toHaveValue('john@example.com');
  });
});

test.describe('Contact Information Display', () => {
  test('should display company phone number', async ({ page }) => {
    await page.goto('/en/contact');

    // Use .first() since there are multiple phone links (nav, content, footer)
    const phoneLink = page.locator('a[href^="tel:"]').first();
    await expect(phoneLink).toBeVisible();
  });

  test('should display company email', async ({ page }) => {
    await page.goto('/en/contact');

    // Use .first() since there are multiple email links (nav, content, footer)
    const emailLink = page.locator('a[href^="mailto:"]').first();
    await expect(emailLink).toBeVisible();
  });

  test('should display company address', async ({ page }) => {
    await page.goto('/en/contact');

    // Look for address element or text containing typical address patterns
    const addressText = page.getByText(/Vancouver|BC|British Columbia/i);
    await expect(addressText.first()).toBeVisible();
  });
});
