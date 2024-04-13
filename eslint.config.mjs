// eslint.config.js

import xo from 'eslint-config-xo';

export default [
  {
    ignores: ['.eslintrc.js', 'dist/**', 'node_modules/**', 'bin/**', 'build/**', 'lib/i18n/gettext-parser/**'],
  },
  {
    rules: {
      ...xo.rules,
      'object-curly-spacing': ['error', 'always'],
      indent: ['error', 2, { ImportDeclaration: 1, SwitchCase: 1 }],
      'new-cap': ['error', { capIsNew: false }],
      camelcase: ['error', { ignoreImports: true, properties: 'never' }],
      'capitalized-comments': 'off',
      'max-params': ['error', 6],
    },
    languageOptions: {
      globals: {
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
      },
    },
  },
];
