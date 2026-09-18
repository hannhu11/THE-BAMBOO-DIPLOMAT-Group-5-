import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['{packages,apps}/*/src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'legacy-reference/**', 'THE-BAMBOO-DIPLOMAT/legacy-reference/**'],
  },
});
