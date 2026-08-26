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
      use: { ...devices['Desktop Chrome'] },
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
