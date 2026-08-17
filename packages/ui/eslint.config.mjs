import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    rules: {
      // Measured on this repo: switching ONE icon from the deep path to the
      // barrel grew the iOS bundle from 5.38MB to 7.20MB (+1.82MB, +34%).
      // Metro does not tree-shake — its experimental pass is off by default
      // and metro.config.js must stay optionless — so the barrel pulls all
      // 1768 icon modules in for a single glyph. Import by path instead:
      //   import Check from 'lucide-react-native/icons/check';
      //
      // The typescript-eslint version of this rule is required rather than the
      // core one: only it implements `allowTypeImports`, which is what keeps
      // `import type { LucideProps }` in icon.tsx legal. Babel erases that, so
      // it costs nothing.
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react-native",
              allowTypeImports: true,
              message:
                "Import icons by path — e.g. `import Check from 'lucide-react-native/icons/check'`. The barrel adds ~1.8MB to the iOS bundle because Metro does not tree-shake.",
            },
          ],
        },
      ],
    },
  },
];
