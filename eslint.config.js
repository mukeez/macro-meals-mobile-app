const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactNative = require('eslint-plugin-react-native');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        // React Native globals
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        AbortController: 'readonly',
        process: 'readonly',
        __DEV__: 'readonly',
        alert: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly',
        localStorage: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-native': reactNative,
    },
    rules: {
      // Unused imports and variables
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-unused-vars': 'off', // Turn off base rule as it conflicts with TypeScript rule
      
      // React specific rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // We use TypeScript for prop validation
      
      // React Native specific rules
      'react-native/no-unused-styles': 'error',
      'react-native/split-platform-components': 'error',
      'react-native/no-inline-styles': 'off', // Disabled - inline styles are common in RN
      'react-native/no-color-literals': 'off', // Disabled - color literals are common in RN
      
      // General code quality
      'no-console': 'off', // Disabled - console statements are useful for debugging
      'prefer-const': 'error',
      'no-var': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: [
      'node_modules/',
      'android/',
      'ios/',
      '*.config.js',
      'metro.config.js',
      'babel.config.js',
      'dist/',
      'build/',
    ],
  },
]; 