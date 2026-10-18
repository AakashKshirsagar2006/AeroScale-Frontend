import { Ban } from 'lucide-react';
import { SaleTimer, StockMeter, saleState } from '@/features/catalog';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/format';
import { useNow } from '@/shared/lib/useNow';
import { Button } from '@/shared/ui/Button';
import { ProductImage } from '@/shared/ui/ProductImage';

const BADGE = {
  LIVE: ['Live now', 'bg-brand text-white'],
  UPCOMING: ['Scheduled', 'bg-slate-800 text-white'],
  ENDED: ['Ended', 'bg-slate-100 text-slate-700'],
  CANCELLED: ['Cancelled', 'bg-slate-100 text-slate-700'],
};

/** `onCancel(sale)` is offered only before the sale starts. */
export function SellerSaleCard({ sale, onCancel }) {
  const now = useNow();
  const state = sale.status === 'CANCELLED' ? 'CANCELLED' : saleState(sale.flashSale, now);
  const [label, cls] = BADGE[state];
  const dead = state === 'ENDED' || state === 'CANCELLED';

  return (
    <article className={cn('flex flex-col gap-4 rounded-2xl border bg-white p-4 transition duration-300 hover:shadow-lg hover:shadow-slate-900/5 sm:flex-row sm:items-center', state === 'LIVE' ? 'border-brand/40 ring-4 ring-brand/5' : 'border-slate-200')}>
      <div className={cn('size-20 shrink-0 overflow-hidden rounded-xl', dead && 'opacity-60 grayscale')}><ProductImage src={sale.imageUrl} name={sale.productName} /></div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', cls)}>
            {state === 'LIVE' && <span aria-hidden className="size-1.5 animate-glow rounded-full bg-white" />}{label}
          </span>
          <span className="rounded-md bg-brand/10 px-1.5 py-0.5 text-xs font-bold text-brand-700">{sale.discountPercent}% off</span>
        </div>
        <h3 className="truncate text-sm font-semibold text-ink">{sale.productName}</h3>
        <p className="text-sm"><span className="font-extrabold text-ink">{formatPrice(sale.salePrice)}</span> <s className="ml-1 text-slate-500">{formatPrice(sale.price)}</s></p>
        {!dead && <SaleTimer flashSale={sale.flashSale} />}
      </div>

      <div className="w-full space-y-3 sm:w-56">
        <StockMeter flashSale={sale.flashSale} />
        {state === 'UPCOMING' && <Button variant="secondary" size="sm" fullWidth onClick={() => onCancel(sale)}><Ban className="size-4" aria-hidden />Cancel sale</Button>}
      </div>
    </article>
  );
}
