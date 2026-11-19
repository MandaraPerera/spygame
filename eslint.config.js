import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importPlugin from "eslint-plugin-import";
import {defineConfig, globalIgnores} from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            import: importPlugin,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                {allowConstantExport: true},
            ],
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    pathGroups: [{pattern: '@/**', group: 'internal', position: 'after'}],
                    pathGroupsExcludedImportTypes: ['builtin'],
                    alphabetize: {order: 'asc', caseInsensitive: true}
                }
            ],
            'import/no-unresolved': 'error',
            'import/no-extraneous-dependencies': 'error',
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project: "./tsconfig.json"
                }
            }
        }
    },
])
