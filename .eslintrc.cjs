module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    node: true 
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier' // Must be last to override other formatting rules
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '*.config.js', '*.config.ts', 'Just for Reference/**/*'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react-refresh',
    '@typescript-eslint',
    'react'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // React specific rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off', // We use TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
    'react/jsx-uses-react': 'off', // Not needed with new JSX transform
    'react/jsx-no-target-blank': 'error',
    'react/jsx-key': 'error',
    
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    // '@typescript-eslint/prefer-const': 'error', // Using regular prefer-const instead
    '@typescript-eslint/no-var-requires': 'error',
    
    // General code quality rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    
    // Code style rules (handled by Prettier, but some logical ones)
    'curly': ['error', 'multi-line'],
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    
    // Import/Export rules
    'no-duplicate-imports': 'error',
    
    // Performance and best practices
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error'
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      env: {
        jest: true,
        'vitest-globals/env': true
      },
      extends: ['plugin:vitest-globals/recommended'],
      rules: {
        // Allow console in tests
        'no-console': 'off',
        // Allow any in tests for mocking
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
}