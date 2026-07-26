// playwright.config.ts  (monorepo root)
// QA-04 — Playwright E2E configuration
//
// Browser  : Chromium only (add Firefox/WebKit in QA-05 if Architect approves)
// Base URL : http://localhost:3000  (Next.js dev server)
// Failures : screenshot (PNG) + video recorded — both saved to test-results/
// Run      : pnpm exec playwright test
// Report   : pnpm exec playwright show-report
//
// Auth state:
//   Fixtures (tests/e2e/fixtures/auth.setup.ts) log in once per worker and
//   store cookies in playwright/.auth/user.json — reused via storageState.
//   This avoids repeating the login flow in every test file.

import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Load E2E-specific env (DATABASE_URL for seed scripts, NEXTAUTH_SECRET, etc.)
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

// ── Auth storage paths ─────────────────────────────────────────────────────────
// One JSON file per role — expand as roles are added (TEACHER, ADMIN, etc.)
export const STORAGE_STATE = {
  student: path.resolve(__dirname, 'playwright/.auth/student.json'),
  admin: path.resolve(__dirname, 'playwright/.auth/admin.json'),
} as const;

export default defineConfig({
  // ── Test discovery ─────────────────────────────────────────────────────────
  testDir: path.resolve(__dirname, 'tests/e2e'),
  testMatch: '**/*.e2e.{ts,tsx}',

  // ── Global timeout budgets ──────────────────────────────────────────────────
  timeout: 30_000,           // per-test timeout (ms)
  expect: {
    timeout: 5_000,          // per-assertion timeout — fail fast on bad selectors
  },

  // ── Parallelism ─────────────────────────────────────────────────────────────
  // Each worker gets its own browser context.
  // fullyParallel: true is safe because tests must not share DB state —
  // each test file seeds and cleans its own data.
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,   // fewer workers on CI to stay within RAM

  // ── Retries ─────────────────────────────────────────────────────────────────
  // Retry once on CI (flaky network, cold start) — never locally (masks bugs)
  retries: process.env.CI ? 1 : 0,

  // ── Artefacts on failure ────────────────────────────────────────────────────
  // Screenshots and videos are captured ONLY when a test fails — no noise
  // during green runs, full evidence on red ones.
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',

    // Screenshot: one PNG per failed test, saved to test-results/<test>/
    screenshot: 'only-on-failure',

    // Video: recorded for every test but retained only on failure
    video: 'retain-on-failure',

    // Trace: capture a full Playwright trace on first retry (CI only)
    // Open with:  npx playwright show-trace trace.zip
    trace: process.env.CI ? 'on-first-retry' : 'off',

    // Default navigation timeout (navigating to pages, waiting for hydration)
    navigationTimeout: 15_000,
    actionTimeout: 8_000,

    // Locale + timezone — keep consistent across environments
    locale: 'en-US',
    timezoneId: 'UTC',

    // Viewport — standard desktop (responsive tests get their own project)
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors from self-signed certs in local dev
    ignoreHTTPSErrors: true,
  },

  // ── Output directories ─────────────────────────────────────────────────────
  outputDir: 'test-results',          // screenshots, videos, traces

  // ── Reporters ──────────────────────────────────────────────────────────────
  reporter: [
    // Human-readable in terminal
    ['list'],
    // HTML report (open with: npx playwright show-report)
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // Machine-readable for CI artifact ingestion
    ['json', { outputFile: 'playwright-report/results.json' }],
    // GitHub Actions annotations (no-op locally)
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],

  // ── Projects ───────────────────────────────────────────────────────────────
  projects: [
    // ── Setup project: logs in and saves auth cookies ──────────────────────
    // This runs before any test project that depends on it.
    {
      name: 'auth-setup',
      testMatch: '**/auth.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Main test project: Chromium only (QA-04 scope) ────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Reuse the student session saved by auth-setup
        storageState: STORAGE_STATE.student,
      },
      // Depends on auth-setup completing first
      dependencies: ['auth-setup'],
      // Exclude the setup file itself from this project
      testIgnore: ['**/auth.setup.ts'],
    },

    // ── Unauthenticated tests — no storageState ────────────────────────────
    // Tests like /login, /register, 401 redirects run without stored auth.
    {
      name: 'chromium-unauth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.unauth.e2e.ts',
      testIgnore: ['**/auth.setup.ts'],
    },
  ],

  // ── Web server ─────────────────────────────────────────────────────────────
  // Playwright starts the Next.js dev server automatically before tests run.
  // CI should set SKIP_WEBSERVER=true and start the server in a separate step
  // (e.g. next build && next start) for production-like fidelity.
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        command: 'pnpm --filter web dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        // Give Next.js up to 60s to cold-start (type-checking + compilation)
        timeout: 60_000,
        // Pipe Next.js output to Playwright's terminal for debugging
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
          NODE_ENV: 'test',
          // NEXTAUTH_URL must match baseURL exactly
          NEXTAUTH_URL: 'http://localhost:3000',
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'playwright-test-secret',
          DATABASE_URL: process.env.DATABASE_URL ?? '',
        },
      },
});

// ── Required directory: playwright/.auth/ ──────────────────────────────────────
// git-ignore this directory (it contains session cookies):
//   echo "playwright/.auth/" >> .gitignore
//
// auth.setup.ts template (tests/e2e/fixtures/auth.setup.ts):
//
//   import { test as setup } from '@playwright/test';
//   import { STORAGE_STATE } from '../../../playwright.config';
//
//   setup('authenticate as student', async ({ page }) => {
//     await page.goto('/login');
//     await page.getByLabel('Email').fill(process.env.TEST_STUDENT_EMAIL!);
//     await page.getByLabel('Password').fill(process.env.TEST_STUDENT_PASSWORD!);
//     await page.getByRole('button', { name: 'Sign in' }).click();
//     await page.waitForURL('/dashboard');
//     await page.context().storageState({ path: STORAGE_STATE.student });
//   });
