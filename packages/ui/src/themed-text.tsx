import { Text, type TextProps } from 'react-native';

/**
 * Typography primitive. Colour comes from @repo/tokens, so light/dark tracks
 * the OS with no useColorScheme branching at the call site.
 */
export type ThemedTextProps = TextProps & {
  className?: string;
  type?:
    | 'default'
    | 'title'
    | 'subtitle'
    | 'small'
    | 'smallBold'
    | 'link'
    | 'linkPrimary'
    | 'code';
  /** Override the default foreground colour. */
  themeColor?: 'fg' | 'fgMuted' | 'brand' | 'danger';
};

const TYPES = {
  default: 'text-base font-medium',
  title: 'text-5xl font-semibold',
  subtitle: 'text-3xl font-semibold',
  small: 'text-sm font-medium',
  smallBold: 'text-sm font-bold',
  link: 'text-sm',
  linkPrimary: 'text-sm text-brand',
  code: 'text-xs font-mono android:font-bold',
} as const;

const COLORS = {
  fg: 'text-fg',
  fgMuted: 'text-fg-muted',
  brand: 'text-brand',
  danger: 'text-danger',
} as const;

export function ThemedText({
  type = 'default',
  themeColor,
  className,
  ...rest
}: ThemedTextProps) {
  // linkPrimary carries its own colour; only fall back to `fg` otherwise.
  const color = themeColor
    ? COLORS[themeColor]
    : type === 'linkPrimary'
      ? ''
      : COLORS.fg;

  return (
    <Text className={`${TYPES[type]} ${color} ${className ?? ''}`} {...rest} />
  );
}
