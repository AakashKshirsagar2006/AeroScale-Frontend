import { Fragment } from 'react';
import { cn } from '@/shared/lib/cn';
import { splitDuration } from '@/shared/lib/format';
import { useNow } from '@/shared/lib/useNow';
import { saleState } from '../model/sale';

/** Live: "Ends in 02:14:36" | Upcoming: "Starts in ..." | Ended. `size="lg"` is the big hero/detail version. */
export function SaleTimer({ flashSale, size = 'sm', className }) {
  const now = useNow();
  const state = saleState(flashSale, now);
  if (state === 'NONE') return null;

  if (state === 'ENDED') {
    return <span className={cn('rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600', className)}>Sale ended</span>;
  }
  const target = state === 'LIVE' ? flashSale.endsAt : flashSale.startsAt;
  const { h, m, s } = splitDuration(target - now);
  const lg = size === 'lg';

  return (
    <div role="timer" aria-label={`${state === 'LIVE' ? 'Ends' : 'Starts'} in ${h} hours ${m} minutes ${s} seconds`} className={cn('flex items-center gap-1.5', className)}>
      <span className={cn('text-slate-600', lg ? 'mr-1 text-sm' : 'mr-0.5 text-xs')}>{state === 'LIVE' ? 'Ends in' : 'Starts in'}</span>
      {[h, m, s].map((v, i) => (
        <Fragment key={i}>
          <span aria-hidden className={cn(
            'grid place-items-center rounded-lg font-bold tabular-nums text-white',
            state === 'LIVE' ? 'bg-brand' : 'bg-slate-700',
            lg ? 'h-11 min-w-11 px-2 text-lg' : 'h-6 min-w-6 px-1 text-[11px]',
          )}>{v}</span>
          {i < 2 && <span aria-hidden className="font-bold text-slate-400">:</span>}
        </Fragment>
      ))}
    </div>
  );
}
