/**
 * This is the "new" ESLint flat configuration.
 * @see https://eslint.org/docs/latest/use/configure/configuration-files-new
 *
 * To make this works in VSCode (until this becomes the default), make sure to add this to your
 * workspace settings:
 *
 * "eslint.experimental.useFlatConfig": true
 */
import jsPlugin from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import cypressPlugin from 'eslint-plugin-cypress/flat'
import importXPlugin from 'eslint-plugin-import-x'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import jsonFilesPlugin from 'eslint-plugin-json-files'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import preferArrowFunctionsPlugin from 'eslint-plugin-prefer-arrow-functions'
import prettierRecommendedConfig from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import tsdocPlugin from 'eslint-plugin-tsdoc'
import unicornPlugin from 'eslint-plugin-unicorn'
import globals from 'globals'
import * as jsoncParser from 'jsonc-eslint-parser'

// React Hooks is temporary disabled until this issue is fixed: https://github.com/facebook/react/issues/28313
// import reactHooksPlugin from 'eslint-plugin-react-hooks'

const JAVASCRIPT_FILES = ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs']
const TYPESCRIPT_FILES = ['**/*.ts', '**/*.mts', '**/*.cts', '**/*.tsx']

export default [
  // Files to ignore (replaces `.eslintignore`).
  {
    // ESLint ignores `node_modules` and dot-files by default.
    // @see https://eslint.org/docs/latest/user-guide/configuring/ignoring-code
    ignores: [
      // Compiled project.
      'lib/',
      // Example project.
      'example/',
    ],
  },
  {
    settings: {
      // Automatically detect the React version.
      react: {
        version: 'detect',
      },
    },
  },
  // Base configuration.
  {
    languageOptions: {
      // Enable Node.js specific globals.
      // @see https://eslint.org/docs/latest/use/configure/migration-guide
      globals: {
        ...globals.node,
      },
      parserOptions: {
        // Use the latest ECMAScript features.
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  // Unicorn recommended configs.
  // @see https://github.com/sindresorhus/eslint-plugin-unicorn
  unicornPlugin.configs['flat/recommended'],
  // Prettier recommended configs.
  // @see https://github.com/prettier/eslint-plugin-prettier
  prettierRecommendedConfig,
  // React specific linting rules for ESlint.
  // @see https://github.com/jsx-eslint/eslint-plugin-react
  reactPlugin.configs.flat.recommended,
  // New JSX transform from React 17.
  reactPlugin.configs.flat['jsx-runtime'],
  // Spot accessibility issues in React apps.
  // @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
  jsxA11yPlugin.flatConfigs.recommended,
  // Cypress specific linting rules for ESlint.
  // @see https://github.com/cypress-io/eslint-plugin-cypress
  cypressPlugin.configs.recommended,
  // TypeScript and JavaScript files.
  {
    files: [...TYPESCRIPT_FILES, ...JAVASCRIPT_FILES],
    plugins: {
      'import-x': importXPlugin,
      'prefer-arrow-functions': preferArrowFunctionsPlugin,
    },
    settings: {
      // Fixes https://github.com/import-js/eslint-plugin-import/issues/2556
      'import-x/parsers': {
        espree: [
          ...JAVASCRIPT_FILES.map((pattern) => pattern.replace('**/*', '')),
          TYPESCRIPT_FILES.map((pattern) => pattern.replace('**/*', '')),
        ],
      },
      'import-x/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      ...importXPlugin.configs.recommended.rules,
      'prefer-arrow-functions/prefer-arrow-functions': [
        // There is no recommended configuration to extend so we have to set it here to enforce arrow functions.
        // @see https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions
        'warn',
        {
          classPropertiesAllowed: false,
          disallowPrototype: false,
          returnStyle: 'unchanged',
          singleReturnOnly: false,
        },
      ],
      // Make sure there is always a space before comments.
      // @see https://eslint.org/docs/latest/rules/spaced-comment
      'spaced-comment': ['error'],
      // Prevent omission of curly brace (e.g. same-line if/return).
      // @see https://eslint.org/docs/latest/rules/curly
      curly: ['error'],
      // The Unicorn plugin comes with opinionated checks, including some that we prefer disabling.
      'unicorn/no-array-reduce': [
        // 'reduce' is a powerful method for functional programming patterns, use it when appropriate.
        'off',
      ],
      'unicorn/no-array-for-each': [
        // Performance is no longer an issue - we prefer `forEach` for readability.
        'off',
      ],
      'unicorn/numeric-separators-style': [
        // Doesn't add a lot of value and makes numbers look odd.
        'off',
      ],
      'unicorn/prefer-type-error': [
        // Not really applicable when using TypeScript (mostly triggers false positives).
        'off',
      ],
      'unicorn/no-null': [
        // `undefined` and `null` have distinct semantics (i.e. `undefined` means absent, while
        // `null` means explicitly set to empty). We prefer to keep both in our codebase.
        'off',
      ],
      'unicorn/number-literal-case': [
        // This rule conflicts with `prettier/prettier` and there is no way to disabled the prettier rule.
        // @see https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2285
        'off',
      ],
      'unicorn/prefer-top-level-await': [
        // Add little value and would require polyfills for engines older than ES2022.
        'off',
      ],
    },
  },
  // JavaScript files.
  {
    files: JAVASCRIPT_FILES,
    plugins: {
      jsdoc: jsdocPlugin,
    },
    rules: {
      ...jsdocPlugin.configs.recommended.rules,
      // ESLint recommended rules (no plugins config required).
      // @see https://www.npmjs.com/package/@eslint/js
      ...jsPlugin.configs.recommended.rules,
      // Increase the level to 'error' for unused variables (the default is set to 'warning').
      // @see https://eslint.org/docs/latest/rules/no-unused-vars
      'no-unused-vars': ['error', { args: 'all' }],
    },
  },
  // TypeScript files.
  {
    files: TYPESCRIPT_FILES,
    plugins: {
      'import-x': importXPlugin,
      tsdoc: tsdocPlugin,
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.cypress.json'],
      },
    },
    rules: {
      ...importXPlugin.configs.typescript.rules,
      // Validates that TypeScript doc comments conform to the TSDoc specification.
      // @see https://tsdoc.org/pages/packages/eslint-plugin-tsdoc/
      'tsdoc/syntax': 'warn',
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      // Enforces explicit return types on functions and class methods to avoid unintentionally breaking contracts.
      // @see https://typescript-eslint.io/rules/explicit-module-boundary-types/
      '@typescript-eslint/explicit-function-return-type': 'error',
      // Checks members (classes, interfaces, types) and applies consistent ordering.
      // @see https://typescript-eslint.io/rules/member-ordering/
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            memberTypes: ['field', 'constructor', 'method'],
          },
        },
      ],
    },
  },
  // JSON files.
  {
    files: ['*.json'],
    ignores: ['**/package.json'],
    languageOptions: {
      parser: jsoncParser,
    },
  },
  // package.json files.
  {
    files: ['**/package.json'],
    plugins: {
      'json-files': jsonFilesPlugin,
    },
    processor: jsonFilesPlugin.processors['.json'],
    rules: {
      // Requires the `license` field in package.json.
      // @see https://github.com/kellyselden/eslint-plugin-json-files/blob/master/docs/rules/require-license.md
      'json-files/require-license': ['error', 'allow-unlicensed'],
      // Prevents dependency collisions between `dependencies` and `devDependencies` in package.json.
      // @see https://github.com/kellyselden/eslint-plugin-json-files/blob/master/docs/rules/require-unique-dependency-names.md
      'json-files/require-unique-dependency-names': ['error'],
      // Use sort-package-json to keep your keys in a predictable order.
      // @see https://github.com/kellyselden/eslint-plugin-json-files/blob/master/docs/rules/sort-package-json.md
      'json-files/sort-package-json': ['error'],
    },
  },
  // Rules applying to all files.
  {
    rules: {
      'unicorn/prevent-abbreviations': [
        'error',
        {
          ignore: [
            // Commonly used "environment" abbreviation in Node.js.
            'env',
            // Used by Cypress for end-to-end tests.
            'e2e',
            // React props.
            'props',
            'Props',
          ],
        },
      ],
    },
  },
]
