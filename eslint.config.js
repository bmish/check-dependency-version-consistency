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
  eslintPluginImport.flatConfigs.typescript,
  eslintPluginJest.configs['flat/recommended'],
  eslintPluginN.configs['flat/recommended'],
  eslintPluginPrettierRecommended,
  eslintPluginUnicorn.configs['flat/recommended'],
  ...tseslint.configs.strictTypeChecked,

  // Individual rules:
  {
    rules: {
      'n/no-missing-import': 'off', // bug with recognizing node: prefix https://github.com/mysticatea/eslint-plugin-node/issues/275

      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
        },
      ],

      // unicorn rules:
      'unicorn/import-style': 'off',
      'unicorn/no-useless-undefined': 'off', // We use a lot of `return undefined` to satisfy the `consistent-return` rule.

      // typescript-eslint rules:
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error',

      // Optional eslint rules:
      'array-callback-return': 'error',
      'block-scoped-var': 'error',
      complexity: 'error',
      'consistent-return': 'error',
      curly: 'error',
      'default-case': 'error',
      eqeqeq: 'error',
      'func-style': ['error', 'declaration'],
      'new-parens': 'error',
      'no-async-promise-executor': 'error',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-implicit-coercion': 'error',
      'no-implied-eval': 'error',
      'no-lone-blocks': 'error',
      'no-multiple-empty-lines': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-octal-escape': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-return-assign': 'error',
      'no-return-await': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-shadow-restricted-names': 'error',
      'no-template-curly-in-string': 'error',
      'no-throw-literal': 'error',
      'no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
      'no-use-before-define': ['error', 'nofunc'],
      'no-useless-call': 'error',
      'no-useless-catch': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-constructor': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-void': 'error',
      'no-with': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      quotes: [
        'error',
        'single', // Must match quote style enforced by prettier.
        // Disallow unnecessary template literals.
        { avoidEscape: true, allowTemplateLiterals: false },
      ],
      radix: 'error',
      'require-atomic-updates': 'error',
      'require-await': 'error',
      'spaced-comment': ['error', 'always', { markers: ['*', '!'] }],
      'sort-vars': 'error',
      yoda: 'error',

      // import rules:
      'import/default': 'error',
      'import/export': 'error',
      'import/extensions': ['error', 'always'],
      'import/first': 'error',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/newline-after-import': 'error',
      'import/no-absolute-path': 'error',
      'import/no-cycle': 'error',
      'import/no-deprecated': 'error',
      'import/no-duplicates': 'error',
      'import/no-dynamic-require': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-named-default': 'error',
      'import/no-self-import': 'error',
      'import/no-unassigned-import': 'error',
      'import/no-unresolved': 'off',
      'import/no-unused-modules': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-webpack-loader-syntax': 'error',
    },

    // typescript-eslint parser options:
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname, // eslint-disable-line n/no-unsupported-features/node-builtins
      },
    },

    linterOptions: {
      reportUnusedDisableDirectives: 'error',
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

      // test coverage
      'coverage/**',
    ],
  },
);
