import { cn } from '../lib/cn';

/** Grey block with a moving sheen. Size it with className. */
export const Skeleton = ({ className }) => (
  <div aria-hidden className={cn('relative overflow-hidden rounded-xl bg-slate-200/70', className)}>
    <div className="absolute inset-0 animate-sheen bg-linear-to-r from-transparent via-white/70 to-transparent" />
  </div>
);
