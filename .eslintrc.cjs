module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: [
    'plugin:square/typescript',
    'plugin:node/recommended',
    'plugin:unicorn/recommended', // Turn eslint-plugin-unicorn recommended rules on again because many were turned off by eslint-plugin-square.
    'plugin:jest/recommended',
  ],
  env: {
    node: true,
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts', '.d.ts'],
    },
  },
  rules: {
    'import/extensions': ['error', 'always'],

    'node/no-missing-import': 'off', // bug with recognizing node: prefix https://github.com/mysticatea/eslint-plugin-node/issues/275

    'unicorn/no-useless-undefined': 'off', // We use a lot of `return undefined` to satisfy the `consistent-return` rule.
  },
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        'node/no-unsupported-features/es-syntax': [
          'error',
          { ignores: ['modules'] },
        ],

        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/require-array-sort-compare': 'error',
      },
    },
  ],
};
