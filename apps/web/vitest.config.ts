// apps/web/vitest.config.ts
// QA-02 — Frontend unit + component test configuration
// Environment : jsdom (browser-like DOM, needed for RTL)
// Stack       : React Testing Library + @testing-library/user-event
// Coverage    : v8 provider, 80% threshold
// Run         : pnpm --filter web test
// Coverage    : pnpm --filter web test:coverage

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // ── Vite plugins ────────────────────────────────────────────────────────────
  // @vitejs/plugin-react is required so JSX/TSX transforms work in Vitest
  plugins: [react()],

  test: {
    // ── Runtime ───────────────────────────────────────────────────────────────
    name: 'web',
    // jsdom provides window, document, localStorage, etc.
    // Required by React Testing Library and any component that touches the DOM
    environment: 'jsdom',

    root: path.resolve(__dirname, '.'),

    include: [
      'src/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      '.next',
      'coverage',
      '**/*.e2e.{test,spec}.{ts,tsx}',
    ],

    // ── Setup ─────────────────────────────────────────────────────────────────
    setupFiles: ['src/tests/setup.ts'],
    // setup.ts must contain:
    //   import '@testing-library/jest-dom';           // extends expect with .toBeInTheDocument() etc.
    //   import { cleanup } from '@testing-library/react';
    //   afterEach(() => cleanup());                   // unmount components after each test
    //   vi.mock('next/navigation', () => ({           // mock Next.js router
    //     useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    //     usePathname: () => '/',
    //     useSearchParams: () => new URLSearchParams(),
    //   }));
    //   vi.mock('next-auth/react', () => ({           // mock NextAuth session
    //     useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
    //     signIn: vi.fn(),
    //     signOut: vi.fn(),
    //   }));

    // ── Global test APIs ──────────────────────────────────────────────────────
    // Makes describe/it/expect/vi available without explicit imports
    globals: true,

    // ── Isolation ─────────────────────────────────────────────────────────────
    // threads pool is fine for DOM tests (no shared native modules)
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1,
      },
    },

    clearMocks: true,
    restoreMocks: true,

    // ── Reporting ─────────────────────────────────────────────────────────────
    reporters: ['verbose', 'json'],
    outputFile: {
      json: 'coverage/test-results.json',
    },

    // ── Coverage ───────────────────────────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',

      include: [
        'src/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/tests/**',
        // Next.js internals — not our code
        'src/app/layout.tsx',          // Root layout (pure config)
        'src/app/providers.tsx',       // SessionProvider wrapper
        'src/middleware.ts',           // Route middleware — integration tested
        'src/types/**',
      ],

      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },

      all: true,
    },

    // ── Aliases ───────────────────────────────────────────────────────────────
    // Must mirror next.config.ts / tsconfig.json paths exactly
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@tests': path.resolve(__dirname, 'src/tests'),
    },

    // ── CSS / static asset handling ───────────────────────────────────────────
    // CSS modules and static imports that Next.js handles at build time
    // must be stubbed so tests don't throw on non-JS imports
    css: false,   // don't process CSS — stub it
  },

  // ── Resolve ──────────────────────────────────────────────────────────────────
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
