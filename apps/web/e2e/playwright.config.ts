import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // socket tests need ordering
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list'],
  ],
  timeout: 30_000,
  expect: { timeout: 8_000 },

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Auth state setup — runs first
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Main test suites depend on auth state
    {
      name: 'chat',
      testDir: './tests/chat',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'fixtures/.auth/userA.json',
      },
    },
    {
      name: 'video',
      testDir: './tests/video',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'fixtures/.auth/userA.json',
      },
    },
    {
      name: 'notifications',
      testDir: './tests/notifications',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'fixtures/.auth/userA.json',
      },
    },
    {
      name: 'auth-security',
      testDir: './tests/auth',
      // No storageState — testing unauthenticated flows
    },
    {
      name: 'regression',
      testDir: './tests/regression',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'fixtures/.auth/userA.json',
      },
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
