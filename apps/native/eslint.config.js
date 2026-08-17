// Explicit config so `expo lint` does not generate one on every run (which
// makes the task non-deterministic and uncacheable).
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'expo-env.d.ts', 'nativewind-env.d.ts'],
  },
  {
    // Scoped to TS: `eslint-config-expo/flat` only registers the
    // `@typescript-eslint` plugin for these files, and a rule referencing a
    // plugin that is not in scope is a hard config error.
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      // Mirrors packages/ui/eslint.config.mjs. The rule has to exist in BOTH
      // places: `packages/ui` is where the guidance lives, but `apps/native` is
      // what Metro actually bundles, so an app-side barrel import costs the
      // full 1.82MB with nothing in `packages/ui` to catch it.
      //
      // Measured on this repo: switching ONE icon from the deep path to the
      // barrel grew the iOS bundle from 5.38MB to 7.20MB (+1.82MB, +34%).
      // Metro does not tree-shake — its experimental pass is off by default
      // and metro.config.js must stay optionless — so the barrel pulls all
      // 1768 icon modules in for a single glyph. Import by path instead:
      //   import Check from 'lucide-react-native/icons/check';
      //
      // `allowTypeImports` (typescript-eslint only — the core rule has no such
      // option) keeps `import type { LucideProps }` legal; Babel erases it.
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react-native',
              allowTypeImports: true,
              message:
                'Import icons by path — e.g. `import Check from \'lucide-react-native/icons/check\'`. The barrel adds ~1.8MB to the iOS bundle because Metro does not tree-shake.',
            },
          ],
        },
      ],
    },
  },
]);
