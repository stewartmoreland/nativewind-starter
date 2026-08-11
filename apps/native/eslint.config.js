// Explicit config so `expo lint` does not generate one on every run (which
// makes the task non-deterministic and uncacheable).
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'expo-env.d.ts', 'nativewind-env.d.ts'],
  },
]);
