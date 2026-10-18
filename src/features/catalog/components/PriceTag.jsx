import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/format';
import { useNow } from '@/shared/lib/useNow';
import { saleState, unitPrice } from '../model/sale';

export function PriceTag({ item, size = 'md', className }) {
  const now = useNow();
  const live = saleState(item.flashSale, now) === 'LIVE';
  const price = unitPrice(item, now);
  const big = size === 'lg';
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className={cn('font-extrabold tracking-tight text-ink', big ? 'text-3xl' : 'text-lg')}>{formatPrice(price)}</span>
      {live && price < item.price && (
        <>
          <s className={cn('text-slate-500', big ? 'text-base' : 'text-sm')}>{formatPrice(item.price)}</s>
          {big && <span className="rounded-md bg-brand px-2 py-0.5 text-sm font-bold text-white">{item.flashSale.discountPercent}% off</span>}
        </>
      )}
    </div>
  );
}
