import { ChevronLeft, CreditCard, ShieldCheck, Timer } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { catalogApi, PriceTag, purchaseLimit, SaleTimer, saleState, StockMeter, unavailableReason } from '@/features/catalog';
import { useCart } from '@/features/cart';
import { clamp } from '@/shared/lib/format';
import { useAsync } from '@/shared/lib/useAsync';
import { useNow } from '@/shared/lib/useNow';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { ProductImage } from '@/shared/ui/ProductImage';
import { QuantityStepper } from '@/shared/ui/QuantityStepper';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PackageX } from 'lucide-react';
import { addItemToCart } from '../hooks/useAddToCart';

const PROMISES = [
  { Icon: ShieldCheck, text: 'Secure payments' },
  { Icon: Timer, text: 'Stock held while you pay' },
  { Icon: CreditCard, text: 'UPI, cards and netbanking' },
];

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2" role="status" aria-label="Loading product">
      <Skeleton className="aspect-square rounded-3xl" />
      <div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-10 w-1/3" /><Skeleton className="h-24 w-full" /><Skeleton className="h-12 w-full" /></div>
    </div>
  );
}

function Detail({ item }) {
  const now = useNow();
  const navigate = useNavigate();
  const { byProduct } = useCart();
  const inCart = byProduct.get(item.id)?.count ?? 0;
  const limit = purchaseLimit(item, now);
  const reason = unavailableReason(item, now);
  const state = saleState(item.flashSale, now);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(null); // 'add' | 'buy'
  const quantity = clamp(qty, 1, Math.max(limit, 1));

  const add = async () => { setBusy('add'); await addItemToCart(item, quantity); setBusy(null); };
  const buyNow = async () => {
    setBusy('buy');
    const ok = await addItemToCart(item, quantity);
    setBusy(null);
    if (ok || inCart > 0) navigate('/checkout');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <ProductImage src={item.imageUrl} name={item.name} alt={item.name} iconClassName="size-1/4" />
        {state === 'LIVE' && <span className="absolute left-5 top-5 rounded-xl bg-brand px-3 py-1.5 text-sm font-bold text-white shadow-lg shadow-brand/30">{item.flashSale.discountPercent}% off</span>}
      </div>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{item.name}</h1>
        <PriceTag item={item} size="lg" className="mt-4" />

        {state !== 'NONE' && (
          <div className="mt-5 space-y-4 rounded-2xl border border-red-100 bg-linear-to-br from-white to-rose-50 p-4 sm:p-5">
            <SaleTimer flashSale={item.flashSale} size="lg" />
            {state === 'LIVE' && <StockMeter flashSale={item.flashSale} availableStock={item.availableStock} />}
            {state === 'LIVE' && item.flashSale.maxPerUser && <p className="text-sm text-slate-700">Limit of {item.flashSale.maxPerUser} per customer during the sale.</p>}
          </div>
        )}

        <p className="mt-5 text-sm font-semibold">
          {item.availableStock === 0 ? <span className="text-brand-700">Out of stock</span>
            : item.availableStock != null && item.availableStock <= 10 ? <span className="text-amber-700">Only {item.availableStock} left</span>
            : <span className="text-emerald-700">In stock</span>}
          {inCart > 0 && <span className="ml-3 font-medium text-slate-600">{inCart} in your cart</span>}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <QuantityStepper value={quantity} max={Math.max(limit, 1)} onChange={setQty} disabled={Boolean(reason)} label="Quantity to add" />
          {limit > 0 && limit < 99 && <span className="text-xs text-slate-600">Up to {limit} per order</span>}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button onClick={add} loading={busy === 'add'} disabled={Boolean(reason) || busy === 'buy'}>{reason ?? 'Add to cart'}</Button>
          <Button variant="secondary" onClick={buyNow} loading={busy === 'buy'} disabled={Boolean(reason) || busy === 'add'}>Buy now</Button>
        </div>

        <ul className="mt-6 grid gap-2 sm:grid-cols-3">
          {PROMISES.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"><Icon className="size-4 shrink-0 text-brand" aria-hidden />{text}</li>
          ))}
        </ul>

        {item.description && (
          <section className="mt-8">
            <h2 className="text-base font-bold text-ink">About this product</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{item.description}</p>
          </section>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = useAsync(() => catalogApi.getProduct(id), [id]);

  return (
    <div>
      <Link to="/" className="mb-5 inline-flex items-center gap-1 rounded-lg py-1 pr-2 text-sm font-semibold text-slate-700 outline-none hover:text-brand-700 focus-visible:ring-4 focus-visible:ring-accent/30">
        <ChevronLeft className="size-4" aria-hidden />Back to shopping
      </Link>
      {product.status === 'loading' && <DetailSkeleton />}
      {product.status === 'error' && (
        product.error?.response?.status === 404
          ? <EmptyState icon={PackageX} title="This product is not available" text="It may have been removed or is not on sale any more." action={<Link to="/" className="text-sm font-semibold text-brand-700 hover:underline">Back to the shop</Link>} />
          : <ErrorState error={product.error} onRetry={product.reload} title="Could not load this product" />
      )}
      {product.status === 'ready' && <Detail item={product.data} />}
    </div>
  );
}
