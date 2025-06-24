import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', 'junit'], // Output both default console reporter and JUnit XML
    outputFile: 'junit.xml',        // Specify the output file for the JUnit reporter
    coverage: {
      provider: 'v8',               // Use v8 for faster coverage (or 'istanbul')
      reporter: ['text', 'json-summary', 'html', 'lcov'], // Output various coverage formats: text to console, json-summary for programmatic access, html for artifact, lcov for external tools
      reportsDirectory: 'coverage/',// Directory for all coverage reports
    },
  },
});
