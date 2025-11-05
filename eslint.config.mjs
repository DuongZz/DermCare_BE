// eslint.config.ts
import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import jest from 'eslint-plugin-jest'

export default defineConfig([
  {
    ignores: ['dist/', 'node_modules/', 'build/'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{test,spec}.{js,mjs,cjs,ts}'],
    plugins: { jest },
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/prefer-expect-assertions': 'off',
    },
  },
  {
    rules: {
      // Logic rules (không conflict với EditorConfig/Prettier)
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-useless-catch': 'off',
      'no-extra-boolean-cast': 'off',
      'no-lonely-if': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],

      // Variables
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],

      // TypeScript specific
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // TẮT TẤT CẢ STYLE RULES - để EditorConfig + Prettier xử lý
      'indent': 'off',
      'semi': 'off',
      'quotes': 'off',
      'comma-dangle': 'off',
      'comma-spacing': 'off',
      'space-before-blocks': 'off',
      'object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'arrow-spacing': 'off',
      'keyword-spacing': 'off',
      'no-trailing-spaces': 'off',
      'no-multi-spaces': 'off',
      'no-multiple-empty-lines': 'off',
      'linebreak-style': 'off',
      'no-unexpected-multiline': 'off',
      'eol-last': 'off', // EditorConfig xử lý insert_final_newline

      // TypeScript style rules
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/semi': 'off',
      '@typescript-eslint/quotes': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/member-delimiter-style': 'off',
    },
  },
])
