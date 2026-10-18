import { useCountUp } from '../lib/useCountUp';

/** Counts up to `value` when it appears or changes. `format` turns the in-between number into text. */
export function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString('en-IN'), className }) {
  const shown = useCountUp(value);
  return <span className={className}>{format(shown)}</span>;
}
