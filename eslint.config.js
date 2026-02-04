import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
    {
        ignores: ['dist', 'node_modules', 'lint-output.txt'],
    },
    js.configs.recommended,
    {
        files: ['**/*.{js,cjs}'],
        languageOptions: {
            globals: {
                require: 'readonly',
                module: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                console: 'readonly'
            }
        }
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parser: typescriptParser,
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                localStorage: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                console: 'readonly',
                URL: 'readonly',
                Blob: 'readonly',
                FileReader: 'readonly',
                MouseEvent: 'readonly',
                KeyboardEvent: 'readonly',
                DOMException: 'readonly',
                alert: 'readonly',
                HTMLInputElement: 'readonly',
                HTMLDivElement: 'readonly',
                Node: 'readonly'
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            // AI Hygiene & Code Quality Rules
            '@typescript-eslint/no-explicit-any': 'error', // No magic 'any' types
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // No dead code
            'no-console': ['warn', { allow: ['warn', 'error'] }], // Keep production logs clean
            'react-hooks/rules-of-hooks': 'error', // Strict React safety
            'react-hooks/exhaustive-deps': 'warn',
            'prefer-const': 'error', // Enforce immutability where possible
            'no-debugger': 'error', // No leftovers from debugging session
        },
    },
];
