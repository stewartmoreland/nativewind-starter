import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type { ClassValue };

/**
 * Merge Tailwind class strings, last one wins.
 *
 * This is load-bearing, not cosmetic. react-native-css compiles utilities into
 * a stylesheet and resolves conflicts by specificity and source order — exactly
 * like CSS — so the order of classes *within* a `className` string decides
 * nothing. `h-12 h-8` does not give you `h-8`. Running the string through
 * tailwind-merge drops the losing class entirely, which is what makes a
 * consumer's `className` actually override a component's defaults.
 *
 * Every component's last styling act must be `cn(base, variants, className)`.
 *
 * Named `.tsx` despite holding no JSX: the package ships source through
 * `"exports": { "./*": "./src/*.tsx" }`, so a `.ts` file here would make
 * `@repo/ui/lib/cn` unresolvable from an app.
 *
 * The stock tailwind-merge config is correct for @repo/tokens because the token
 * type scale reuses Tailwind's own names (`xs`…`5xl`): `text-sm` lands in the
 * font-size group and `text-fg` / `text-brand` fall through to the colour group,
 * so the two never collide. A fork that renames the type scale must swap this
 * for a configured `extendTailwindMerge`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
