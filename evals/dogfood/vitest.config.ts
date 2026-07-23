import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scorers/**/*.test.ts', 'runner/**/*.test.ts', 'task-config.test.ts'],
    environment: 'node',
  },
});
