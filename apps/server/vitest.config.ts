// apps/server/vitest.config.ts
// QA-01 — Backend unit test configuration
// Environment : Node (no DOM)
// Coverage    : v8 provider, 80% threshold on all metrics
// Run         : pnpm --filter server test
// Coverage    : pnpm --filter server test:coverage

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // ── Runtime ──────────────────────────────────────────────────────────────
    name: 'server',
    environment: 'node',

    // Root for all test files inside the server package
    root: path.resolve(__dirname, '.'),

    // Glob patterns — co-located __tests__ or .test.ts files
    include: [
      'src/**/__tests__/**/*.{test,spec}.ts',
      'src/**/*.{test,spec}.ts',
    ],
    exclude: [
      'node_modules',
      'dist',
      // E2E lives in the root playwright config — keep it out of here
      '**/*.e2e.{test,spec}.ts',
    ],

    // ── Setup ─────────────────────────────────────────────────────────────────
    // Runs once before the entire test suite (DB client teardown, env vars, etc.)
    globalSetup: ['src/tests/globalSetup.ts'],
    // Runs before each test file (resets mocks, loads env)
    setupFiles: ['src/tests/setup.ts'],

    // ── Isolation ─────────────────────────────────────────────────────────────
    // Each test file gets its own worker — prevents shared Prisma client bleed
    pool: 'forks',
    poolOptions: {
      forks: {
        // Limit concurrency so the test DB isn't hammered
        maxForks: 4,
      },
    },

    // Clear mocks between every test automatically
    clearMocks: true,
    restoreMocks: true,

    // ── Reporting ──────────────────────────────────────────────────────────────
    reporters: ['verbose', 'json'],
    outputFile: {
      json: 'coverage/test-results.json',
    },

    // ── Coverage ───────────────────────────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',

      // Only measure coverage on source files (not generated Prisma client)
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/**/*.{test,spec}.ts',
        'src/tests/**',
        'src/prisma/generated/**',   // Prisma generated client
        'src/index.ts',              // Entry-point bootstrap — not business logic
        'src/types/**',
      ],

      // ── Thresholds — CI will fail if any metric drops below 80% ────────────
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        // Per-file thresholds (stricter for critical modules)
        perFile: false,
      },

      // Ensure untested files are counted (don't let zero-covered files hide)
      all: true,
    },

    // ── Aliases ───────────────────────────────────────────────────────────────
    // Mirror the tsconfig paths so imports resolve the same way as in production
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tests': path.resolve(__dirname, 'src/tests'),
    },
  },

  // ── Env vars for test runs ─────────────────────────────────────────────────
  // Vitest automatically loads .env.test — add DATABASE_URL there, not here.
  // Example .env.test:
  //   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/studyspace_test
  //   JWT_SECRET=test-secret-32-chars-minimum!!
  //   NODE_ENV=test
});
