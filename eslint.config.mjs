import next from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

// eslint-config-next 16 ships a native flat config (array), so we spread it
// directly instead of going through the legacy FlatCompat shim. The
// core-web-vitals entry already bundles next/typescript.
const eslintConfig = [
  ...next,
  {
    // Scope our type-aware overrides to TS sources only — running
    // consistent-type-imports (which needs type information) over plain JS
    // config files like this one would error.
    files: ['**/*.{ts,tsx}'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      // react-hooks v6 (bundled with eslint-config-next 16) adds these rules.
      // They flag intentional, working patterns in this codebase (URL-sync
      // setState in ContactForm; the latest-ref pattern in MarketsGlobe), so
      // keep them visible as warnings rather than hard errors. TODO: revisit.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
  {
    ignores: ['out/**', '.next/**', 'node_modules/**', 'scripts/**'],
  },
];

export default eslintConfig;
