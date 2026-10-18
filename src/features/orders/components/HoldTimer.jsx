import { Timer } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { splitDuration } from '@/shared/lib/format';
import { useNow } from '@/shared/lib/useNow';
import { holdDeadline } from '../model/payOrder';

/** "Stock held for 04:12". Turns red in the last minute and says so when the hold is over. */
export function HoldTimer({ order, className }) {
  const now = useNow();
  const left = holdDeadline(order) - now;
  if (left <= 0) {
    return <p className={cn('flex items-center gap-1.5 text-sm font-medium text-brand-700', className)}><Timer className="size-4" aria-hidden />Stock hold expired. Place the order again.</p>;
  }
  const { m, s } = splitDuration(left);
  return (
    <p className={cn('flex items-center gap-1.5 text-sm font-medium', left < 60_000 ? 'text-brand-700' : 'text-slate-700', className)}>
      <Timer className="size-4" aria-hidden />
      We are holding your items for <span className="font-bold tabular-nums">{m}:{s}</span>
    </p>
  );
}
