import { Portal, PortalHost } from '@rn-primitives/portal';
import { Platform } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';

/**
 * Re-exported so `toast.tsx` — and any consumer that needs to render into the
 * host by hand — takes the SAME copy of `@rn-primitives/portal` the overlay
 * primitives resolve. That matters more than it looks: the portal's registry is
 * a module-scope zustand store, so two copies of the package are two stores,
 * and content pushed into one is invisible to a host reading the other. Nothing
 * errors, nothing warns; the overlay is simply never rendered.
 */
export { Portal };

export type UiPortalHostProps = {
  /**
   * iOS only. Marks the window-level container as an accessibility modal, which
   * hides everything behind it from VoiceOver.
   *
   * Defaults to `false`, which is the failure-safe direction: the container is
   * added to the UIWindow as soon as this component mounts, children or not, and
   * react-native-screens defaults the flag to YES — so an app that mounts the
   * host permanently (which is the only correct way to mount it) would risk
   * being shadowed from VoiceOver whenever no overlay is open. Individual
   * dialogs still set `aria-modal` on their own Content, so modality is not
   * lost, only scoped to the overlay container.
   */
  accessibilityModal?: boolean;
  /** Matches `hostName` on a primitive's `Portal`. Omit for the default host. */
  name?: string;
};

/**
 * Renders every portalled overlay in the app. Mount it as the **last** child of
 * the root layout.
 *
 * Three things about that placement are load-bearing:
 *
 * 1. **It must exist at all.** Without a host, every portal-based primitive
 *    renders nothing — silently. No error, no warning, no empty box.
 * 2. **Last child.** React Native has no cross-sibling z-index worth relying
 *    on; paint order is sibling order, and the host has to paint over the
 *    navigator.
 * 3. **Inside expo-router's `ExpoRoot`**, i.e. inside `RootLayout`'s return
 *    rather than above it. Portalled content renders at the HOST's tree
 *    position, so it inherits the host's React context — and
 *    `env(safe-area-inset-*)`, which `pb-safe` and friends compile to, travels
 *    through `VariableContext` published by react-native-css's SafeAreaProvider
 *    wrapper. Mount the host outside that provider and a bottom sheet loses its
 *    home-indicator inset.
 *
 * Colour tokens are NOT subject to (3): react-native-css resolves `:root`
 * variables and the colour scheme from module-scope observables rather than
 * React context, so `bg-overlay` / `bg-surface` and the light/dark flip work
 * inside a portal wherever the host sits.
 *
 * On iOS the host is wrapped in `FullWindowOverlay`, which parents it to the
 * UIWindow instead of to the navigator's view controller. Without it, overlays
 * paint UNDER the navigation bar and under any screen presented with
 * `presentation: 'modal'` — and `@rn-primitives/portal` deprecated its own
 * `useModalPortalRoot` in favour of exactly this pattern. The wrap is a runtime
 * branch rather than an element-type constant because react-native-screens'
 * implementation `console.warn`s on EVERY render off iOS before falling back to
 * a plain View; never rendering it there avoids the noise entirely.
 *
 * Keeping this mounted permanently is safe: the native container's
 * `pointInside:` returns NO unless one of its subviews is hit, so an empty
 * overlay does not swallow touches.
 */
export function UiPortalHost({
  accessibilityModal = false,
  name,
}: UiPortalHostProps) {
  const host = <PortalHost name={name} />;

  if (Platform.OS !== 'ios') return host;

  return (
    <FullWindowOverlay
      unstable_accessibilityContainerViewIsModal={accessibilityModal}
    >
      {host}
    </FullWindowOverlay>
  );
}
