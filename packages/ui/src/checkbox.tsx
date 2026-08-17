import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import Check from 'lucide-react-native/icons/check';

import { Icon } from './icon';
import { cn } from './lib/cn';

export type CheckboxProps = CheckboxPrimitive.RootProps & {
  className?: string;
  /** Styles the indicator that holds the check mark. */
  indicatorClassName?: string;
};

/**
 * Controlled: `checked` is required and the primitive holds no state of its
 * own. The Indicator renders `null` while unchecked, so the check mark does
 * not need hiding — it is simply not there.
 *
 * Do not pass `accessibilityState`: the primitive sets `role`, `aria-checked`
 * and `accessibilityState` and then spreads `{...props}` after them, so a
 * caller's copy would clobber the ones that make this announce as a checkbox.
 */
export function Checkbox({
  checked,
  className,
  indicatorClassName,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      {...props}
      className={cn(
        'size-5 shrink-0 items-center justify-center rounded-sm border border-border bg-surface',
        'active:opacity-80 disabled:opacity-50',
        checked && 'border-brand bg-brand',
        className,
      )}
    >
      <CheckboxPrimitive.Indicator
        className={cn('items-center justify-center', indicatorClassName)}
      >
        <Icon as={Check} className="size-3.5 text-brand-fg" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
