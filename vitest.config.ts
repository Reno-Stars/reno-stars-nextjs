import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // .claude/.agents hold nested agent worktrees (full repo copies) — without
    // these excludes their test files get swept into this repo's run.
    exclude: ['node_modules', '.next', 'tests/e2e/**', '.claude/**', '.agents/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '.next/',
        'drizzle/',
        '.claude/',
        '.agents/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      // `server-only` is a Next.js runtime marker shipped inside the Next
      // bundle — it doesn't resolve outside `next build`. Alias to an empty
      // shim so test imports of server-only modules don't error during
      // Vite's transform pass.
      'server-only': path.resolve(__dirname, './tests/shims/server-only.ts'),
    },
  },
});
