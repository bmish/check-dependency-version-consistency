module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['square'],
  extends: ['plugin:square/base', 'plugin:node/recommended'],
  env: {
    node: true,
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts', '.d.ts'],
    },
  },
  rules: {
    'import/extensions': 'off', // extensions now recommended in ESM

    'node/no-missing-import': 'off', // bug with recognizing node: prefix https://github.com/mysticatea/eslint-plugin-node/issues/275
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      env: {
        mocha: true,
      },
    },
    {
      parser: '@typescript-eslint/parser',
      files: ['*.ts'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'node/no-unsupported-features/es-syntax': [
          'error',
          { ignores: ['modules'] },
        ],
      },
    },
  ],
};
