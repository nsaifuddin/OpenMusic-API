const globals = require('globals');
const pluginJs = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules/', '.env'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      'no-console': ['warn', { 'allow': ['warn', 'error', 'log'] }],
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
      'no-underscore-dangle': ['warn', { 'allowAfterThis': true }],
      'camelcase': ['warn', { 'properties': 'never', 'allow': ['album_id'] }],
      'linebreak-style': ['warn', 'unix'],
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'eqeqeq': 'error',
      'curly': ['warn', 'all'],
      'indent': ['warn', 2]
    },
  },
  {
    files: ['run-migrate.js'],
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', {
        'argsIgnorePattern': '^pgm$|^_',
        'varsIgnorePattern': '^_',
        'caughtErrors': 'all',
        'caughtErrorsIgnorePattern': '^_'
      }],
    }
  },
  {
    files: ['server.js'],
    rules: {
      'no-console': ['warn', { 'allow': ['warn', 'error', 'log'] }],
    }
  }
];