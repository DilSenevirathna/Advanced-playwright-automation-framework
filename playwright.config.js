// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { env } = require('./src/utils/env');
const { AUTH_FILE } = require('./src/utils/paths');

/**
 * Projects at a glance
 *   setup        logs in once and caches the session
 *   chromium /
 *   firefox /
 *   webkit       cross-browser E2E (reuse the cached session)
 *   mobile-chrome smoke tests on a phone viewport
 *   a11y         axe-core accessibility scans
 *   api          REST tests, no browser is launched
 */
module.exports = defineConfig({
  testDir: './tests',
  outputDir: 'test-results',

  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: env.isCI
    ? [['blob'], ['github']]
    : [['list'], ['html', { open: 'never' }], ['./src/reporters/summary-reporter.js']],

  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test',
    headless: !env.headed,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },
    {
      name: 'chromium',
      testMatch: 'e2e/**/*.spec.js',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testMatch: 'e2e/**/*.spec.js',
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testMatch: 'e2e/**/*.spec.js',
      use: { ...devices['Desktop Safari'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      testMatch: 'e2e/**/*.spec.js',
      grep: /@smoke/,
      use: { ...devices['Pixel 7'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'a11y',
      testMatch: 'a11y/**/*.spec.js',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'api',
      testMatch: 'api/**/*.spec.js',
      use: {
        baseURL: env.apiBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
