// @ts-check

import js from '@eslint/js';
import eslintPluginN from 'eslint-plugin-n';
import eslintPluginJest from 'eslint-plugin-jest';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // eslint-disable-line import/extensions -- false positive
import * as eslintPluginImport from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Configs:
  js.configs.recommended,
  eslintPluginImport.flatConfigs
    ? eslintPluginImport.flatConfigs.recommended // TODO: use typescript config
    : {},
  eslintPluginJest.configs['flat/recommended'],
  eslintPluginN.configs['flat/recommended'],
  eslintPluginPrettierRecommended,
  eslintPluginUnicorn.configs['flat/recommended'],
  ...tseslint.configs.recommendedTypeChecked,

  // Individual rules:
  {
    rules: {
      'import/extensions': ['error', 'always'],
      'import/no-unresolved': 'off',

      'n/no-missing-import': 'off', // bug with recognizing node: prefix https://github.com/mysticatea/eslint-plugin-node/issues/275
      'n/no-unsupported-features/es-syntax': [
        'error',
        { ignores: ['modules'] },
      ],

      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
        },
      ],

      'unicorn/import-style': 'off',
      'unicorn/no-useless-undefined': 'off', // We use a lot of `return undefined` to satisfy the `consistent-return` rule.

      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error',
    },

    // typescript-eslint parser options:
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Disabling type-checking for JS files:
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Ignore files:
  {
    ignores: [
      // compiled output
      'dist/**',

      // coverage
      'coverage/**',
    ],
  },
);
