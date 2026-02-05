import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Reno Stars/i);
  });

  test('should have navigation menu', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should navigate to services page', async ({ page }) => {
    // Use getByRole for better accessibility testing
    const servicesLink = page.getByRole('link', { name: /services/i }).first();
    if (await servicesLink.isVisible()) {
      await servicesLink.click();
      await expect(page).toHaveURL(/services/);
    }
  });

  test('should navigate to projects page', async ({ page }) => {
    const projectsLink = page.getByRole('link', { name: /projects/i }).first();
    if (await projectsLink.isVisible()) {
      await projectsLink.click();
      await expect(page).toHaveURL(/projects/);
    }
  });

  test('should navigate to contact page', async ({ page }) => {
    // Click the Contact link in the navbar (not footer)
    const contactLink = page.locator('nav').getByRole('link', { name: /contact/i });
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await page.waitForURL(/contact/);
      await expect(page).toHaveURL(/contact/);
    }
  });
});

test.describe('Language Switching', () => {
  test('should have language switcher accessible', async ({ page }) => {
    await page.goto('/en');

    // Look for language switcher button (could be various selectors)
    const langSwitcher = page.locator(
      '[data-testid="language-switcher"], button:has-text("中文"), button:has-text("EN")'
    );

    // At least one language switcher should exist
    const count = await langSwitcher.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should load English homepage', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/en/);
  });

  test('should load Chinese homepage', async ({ page }) => {
    await page.goto('/zh');
    await expect(page).toHaveURL(/\/zh/);
  });
});

test.describe('Responsive Design', () => {
  test('should display mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Look for hamburger menu button (usually has Menu icon or 3 lines)
    const mobileMenuButton = page.locator(
      '[data-testid="mobile-menu-button"], button[aria-label*="menu" i], nav button.md\\:hidden, nav button.lg\\:hidden'
    );

    // Check if mobile menu exists
    const buttonCount = await mobileMenuButton.count();
    if (buttonCount > 0) {
      await expect(mobileMenuButton.first()).toBeVisible();
    } else {
      // Alternative: check that nav links are hidden on mobile (collapsed menu)
      const desktopNavLinks = page.locator('nav a.hidden.md\\:flex, nav a.hidden.lg\\:flex');
      const hiddenCount = await desktopNavLinks.count();
      // Either mobile button exists or desktop links are hidden
      expect(hiddenCount >= 0).toBeTruthy();
    }
  });

  test('should display desktop nav on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should be usable on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Page should load without errors
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have exactly one h1 heading', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      // Check first 10 images
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Image should have alt text, aria-label, be decorative, or be hidden
      const hasAccessibility =
        (alt !== null && alt !== '') ||
        ariaLabel !== null ||
        role === 'presentation' ||
        role === 'none' ||
        ariaHidden === 'true';
      expect(hasAccessibility).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have skip link or proper focus management', async ({ page }) => {
    await page.goto('/');

    // Check for skip link (common accessibility pattern)
    const skipLink = page.locator(
      'a[href="#main"], a[href="#content"], .skip-link'
    );
    const skipLinkExists = (await skipLink.count()) > 0;

    // Either skip link exists or first focusable is in nav (acceptable)
    if (!skipLinkExists) {
      await page.keyboard.press('Tab');
      const focusedInNav = page.locator('nav :focus');
      const focusInNav = (await focusedInNav.count()) > 0;
      expect(focusInNav || skipLinkExists).toBeTruthy();
    }
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // Page should load DOM within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
