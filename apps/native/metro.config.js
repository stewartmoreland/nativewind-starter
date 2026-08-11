const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// This is the ENTIRE config, deliberately.
//
// - Do NOT add watchFolders / nodeModulesPaths / extraNodeModules /
//   disableHierarchicalLookup. Expo has configured Metro for monorepos since
//   SDK 52 and its docs tell you to DELETE those.
//
// - Do NOT pass options to withNativewind. It defaults to
//   { globalClassNamePolyfill: true, typescriptEnvPath: 'nativewind-env.d.ts' }.
//   globalClassNamePolyfill is a Metro resolveRequest override (not a Babel
//   transform) that redirects `react-native` to `react-native-css/components`,
//   which is what gives plain `className` support to View/Text/Pressable/etc.
//   The preview.2-era advice of { inlineVariables: false,
//   globalClassNamePolyfill: false } + hand-written useCssElement wrappers is
//   obsolete and would leave every primitive unstyled.
module.exports = withNativewind(config);
