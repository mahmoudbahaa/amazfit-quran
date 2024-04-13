module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: 'xo',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'object-curly-spacing': ['error', 'always'],
    indent: ['error', 2, { ImportDeclaration: 'off', SwitchCase: 1 }],
    'new-cap': ['error', { capIsNew: false }],
    camelcase: ['error', { ignoreImports: true, properties: 'never' }],
    'capitalized-comments': 'off',
    'max-params': ['error', 6],
  },
};
