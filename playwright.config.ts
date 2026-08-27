import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      // PW_CHANNEL=chrome runs against a Chrome/Chromium already installed on
      // the machine instead of Playwright's own build. CI needs the option:
      // the Gitea k8s runner cannot reach cdn.playwright.dev (five 30s
      // timeouts on 2026-08-26) even though apt pulls 233 packages from the
      // Ubuntu archives fine, so the bundled-browser download is not always
      // available. Unset locally -> Playwright's pinned build, as before.
      use: {
        ...devices['Desktop Chrome'],
        // PW_CHANNEL picks an installed browser family (e.g. 'chrome');
        // PW_EXECUTABLE points at a specific binary, which is how a
        // distro-packaged chromium gets used. Neither set -> Playwright's own
        // pinned build, which is what happens locally.
        ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
        ...(process.env.PW_EXECUTABLE
          ? { launchOptions: { executablePath: process.env.PW_EXECUTABLE } }
          : {}),
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  // PLAYWRIGHT_NO_SERVER=1 runs the specs against an ALREADY-RUNNING server at
  // BASE_URL. CI uses it so the build job's server (started once, after
  // `pnpm build`, against the seeded Postgres) is reused instead of paying for
  // a second full build — Gitea has no artifacts backend, so `.next` cannot be
  // handed between jobs anyway.
  //
  // It also keeps a local run off port 3000, which is the production port and
  // must never be bound (see the repo's standing orders).
  //
  // The command is `pnpm`, not `npm`: this is a pnpm workspace, and `npm run
  // build` here is how the invoice-service CI port broke.
  webServer: process.env.PLAYWRIGHT_NO_SERVER
    ? undefined
    : {
        command: 'pnpm build && pnpm start',
        url: process.env.BASE_URL || 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
});
