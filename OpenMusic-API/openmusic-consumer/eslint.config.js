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
      'no-console': 'off',
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'linebreak-style': ['warn', process.platform === 'win32' ? 'windows' : 'unix'], // <-- Perubahan hanya di sini
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'eqeqeq': 'error',
      'curly': ['warn', 'all'],
      'indent': ['warn', 2],
    },
  },
];