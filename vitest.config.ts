import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Trend engine is pure TS; tests run in Node. Mirror the tsconfig `@/*` -> `src/*` alias.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
