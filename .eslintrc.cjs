module.exports = {
  env: {
    browser: true,
    es2024: true,
    webextensions: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module'
  },
  globals: {
    chrome: 'readonly',
    browser: 'readonly',
    self: 'readonly',
    window: 'readonly',
    document: 'readonly',
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    fetch: 'readonly',
    Promise: 'readonly',
    Error: 'readonly',
    JSON: 'readonly',
    Array: 'readonly',
    Object: 'readonly',
    String: 'readonly',
    Number: 'readonly',
    Boolean: 'readonly',
    Date: 'readonly',
    Math: 'readonly'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-undef': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': 'error',
    'curly': 'error',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never']
  }
};
