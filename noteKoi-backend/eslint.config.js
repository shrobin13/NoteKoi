const eslintJs = await import('@eslint/js');
const tsPlugin = await import('@typescript-eslint/eslint-plugin');
const tsParser = await import('@typescript-eslint/parser');
const prettierPkg = await import('eslint-config-prettier');

const eslintRecommended = eslintJs.default?.configs?.recommended;
const prettierRules = prettierPkg.default?.rules ?? prettierPkg.rules ?? {};
const tsconfigRootDir = new URL('.', import.meta.url).pathname;

export default [
  eslintRecommended,
  {
    ignores: ['dist/**', 'storage/**', 'generated/**', 'node_modules/**'],
    languageOptions: {
      parser: tsParser.default,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin.default,
    },
    rules: {
      ...tsPlugin.default.configs?.recommended?.rules,
      ...prettierRules,
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'off',
    },
  },
];
