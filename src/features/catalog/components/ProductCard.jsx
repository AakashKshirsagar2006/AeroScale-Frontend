import { Check, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useNow } from '@/shared/lib/useNow';
import { ProductImage } from '@/shared/ui/ProductImage';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Spinner } from '@/shared/ui/Spinner';
import { saleState, unavailableReason } from '../model/sale';
import { PriceTag } from './PriceTag';
import { SaleTimer } from './SaleTimer';
import { StockMeter } from './StockMeter';

/**
 * One card for both kinds of product: regular, and the flash-sale kind (discount badge, timer, claimed bar).
 * It never talks to the cart itself. The page passes `onAdd(item)` (returns a promise) and `inCart` (count).
 */
export function ProductCard({ item, onAdd, inCart = 0 }) {
  const now = useNow();
  const state = saleState(item.flashSale, now);
  const onSale = state !== 'NONE';
  const reason = unavailableReason(item, now);
  const lowStock = item.availableStock != null && item.availableStock > 0 && item.availableStock <= 5;

  const [phase, setPhase] = useState('idle'); // idle | adding | added
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const add = async () => {
    setPhase('adding');
    try {
      const ok = await onAdd(item);
      setPhase(ok === false ? 'idle' : 'added');
      timer.current = setTimeout(() => setPhase('idle'), 1400);
    } catch {
      setPhase('idle');
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <Link to={`/product/${item.id}`} className="relative block aspect-square overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent/40">
        <div className="size-full transition duration-500 group-hover:scale-105">
          <ProductImage src={item.imageUrl} name={item.name} />
        </div>
        {state === 'LIVE' && <span className="absolute left-3 top-3 rounded-lg bg-brand px-2 py-1 text-xs font-bold text-white shadow-lg shadow-brand/30">{item.flashSale.discountPercent}% off</span>}
        {state === 'UPCOMING' && <span className="absolute left-3 top-3 rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-white">Coming soon</span>}
        {lowStock && <span className="absolute right-3 top-3 rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">Only {item.availableStock} left</span>}
        {item.availableStock === 0 && <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-bold text-slate-700 backdrop-blur-[1px]">Out of stock</span>}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink">
            <Link to={`/product/${item.id}`} className="outline-none hover:text-brand-700 focus-visible:underline">{item.name}</Link>
          </h3>
          <PriceTag item={item} className="mt-1.5" />
        </div>

        {onSale && (
          <div className="space-y-2.5">
            <SaleTimer flashSale={item.flashSale} />
            {state === 'LIVE' && <StockMeter flashSale={item.flashSale} availableStock={item.availableStock} />}
          </div>
        )}

        <button
          type="button"
          onClick={add}
          disabled={Boolean(reason) || phase === 'adding'}
          className={cn(
            'mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold outline-none transition focus-visible:ring-4',
            reason
              ? 'cursor-not-allowed bg-slate-100 text-slate-500'
              : phase === 'added'
                ? 'bg-success text-white focus-visible:ring-success/30'
                : 'bg-ink text-white hover:bg-brand focus-visible:ring-brand/30',
          )}
        >
          {phase === 'adding' ? <Spinner /> : phase === 'added' ? <Check className="size-4" aria-hidden /> : !reason && <ShoppingCart className="size-4" aria-hidden />}
          {reason ?? (phase === 'added' ? 'Added' : inCart > 0 ? `Add more (${inCart} in cart)` : 'Add to cart')}
        </button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
