import eslintConfigPrettier from 'eslint-config-prettier';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const typeScriptFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

/** Scope configs that omit `files` so `.cjs` / config scripts are not parsed as TS. */
function scopeTypeScriptEslintConfigs(configs) {
  return configs.map((config) => {
    if (
      config.name === 'typescript-eslint/base' ||
      config.name === 'typescript-eslint/recommended'
    ) {
      return { ...config, files: typeScriptFiles };
    }
    return config;
  });
}

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  ...scopeTypeScriptEslintConfigs(tsPlugin.configs['flat/recommended']),
  {
    files: typeScriptFiles,
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  eslintConfigPrettier,
];
