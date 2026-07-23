import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/dist/**',
      '**/lib/**',
      '**/node_modules/**',
      '.agents/**',
      '.cursor/**',
      'packages/**/test/**',
      'scripts/release.sh',
    ],
  },
  {
    files: ['packages/**/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'prefer-const': 'off',
      'no-case-declarations': 'off',
      'no-useless-assignment': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs', 'packages/**/scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        globalThis: 'readonly',
        process: 'readonly',
      },
    },
  }
);
