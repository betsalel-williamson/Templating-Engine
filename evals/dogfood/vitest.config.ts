import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scorers/**/*.test.ts'],
    environment: 'node',
  },
});
