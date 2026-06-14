import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', 'junit'],
    outputFile: 'junit.xml',
    coverage: {
      provider: 'v8',
      reporter: ['text', ['text', { file: 'text-report.md' }], 'json-summary', 'html', 'lcov'],
      reportsDirectory: 'coverage/',
    },
  },
});
