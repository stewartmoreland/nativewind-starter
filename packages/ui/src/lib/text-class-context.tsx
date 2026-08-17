import { createContext, useContext } from 'react';

/**
 * Carries text classes down to any `Text` rendered inside a container.
 *
 * React Native does not inherit text colour the way the DOM does, so without
 * this every container that needs a differently-coloured label (Button,
 * Badge, Alert, menu items…) would have to own a private map of label classes
 * and forbid arbitrary children. Instead a container publishes the classes its
 * text should take and `Text` merges them over its own defaults.
 *
 * Precedence, lowest to highest: Text's own variant, this context, the
 * caller's `className`.
 */
export const TextClassContext = createContext<string | undefined>(undefined);

export function useTextClass() {
  return useContext(TextClassContext);
}
