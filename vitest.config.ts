import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', 'junit'], // Output both default console reporter and JUnit XML
    outputFile: 'junit.xml', // Specify the output file for the JUnit reporter
    coverage: {
      provider: 'v8', // Use v8 for faster coverage (or 'istanbul')
      reporter: [
        'text', // Outputs a text table to the console by default
        ['text', { file: 'text-report.md' }], // Outputs a text table to a file (for summary embedding)
        'json-summary', // Outputs a JSON summary (for badge percentage)
        'html', // Outputs full HTML report (for artifact upload)
        'lcov', // Outputs LCOV for external tools (e.g., Codecov)
      ],
      reportsDirectory: 'coverage/', // Directory for all coverage reports
    },
  },
});
