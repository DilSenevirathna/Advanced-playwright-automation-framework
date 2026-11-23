const js = require('@eslint/js');
const globals = require('globals');
const playwright = require('eslint-plugin-playwright');

module.exports = [
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.js'],
    settings: { playwright: { globalAliases: { test: ['setup'] } } },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-skipped-test': 'warn',
      'playwright/expect-expect': ['error', { assertFunctionNames: ['scan'] }],
    },
  },
];
