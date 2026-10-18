import { ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartItemRow, maxFor, useCart } from '@/features/cart';
import { parseApiError } from '@/shared/http/errors';
import { formatPrice, plural } from '@/shared/lib/format';
import { Button, ButtonLink } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { toast } from '@/shared/ui/toast';

export function OrderSummary({ items, children, title = 'Order summary' }) {
  const subtotal = items.reduce((n, i) => n + i.unitPrice * i.count, 0);
  const count = items.reduce((n, i) => n + i.count, 0);
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between"><dt className="text-slate-600">Subtotal ({plural(count, 'item')})</dt><dd className="font-medium text-ink">{formatPrice(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-600">Delivery</dt><dd className="font-medium text-emerald-700">Free</dd></div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base"><dt className="font-bold text-ink">Total</dt><dd className="font-extrabold text-ink">{formatPrice(subtotal)}</dd></div>
      </dl>
      {children && <div className="mt-5">{children}</div>}
    </aside>
  );
}

export default function CartPage() {
  const cart = useCart();
  const guard = (promise) => promise.catch((e) => toast.error(parseApiError(e).message));
  const blocked = cart.items.some((i) => i.stock != null && i.count > i.stock) || cart.items.some((i) => maxFor(i) === 0);

  if (cart.status === 'loading' || cart.status === 'idle') {
    return <div className="grid gap-6 lg:grid-cols-[1fr_22rem]"><div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div><Skeleton className="h-64 rounded-2xl" /></div>;
  }
  if (cart.status === 'error') return <ErrorState onRetry={() => guard(cart.reload())} title="Could not load your cart" />;
  if (!cart.items.length) {
    return <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Add a few things you like. Flash prices will not wait." action={<ButtonLink to="/">Start shopping</ButtonLink>} />;
  }

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Your cart <span className="text-base font-medium text-slate-600">({plural(cart.count, 'item')})</span></h1>
        <button type="button" onClick={() => guard(cart.clear())} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-700 outline-none hover:bg-brand/10 focus-visible:ring-4 focus-visible:ring-brand/30"><Trash2 className="size-4" aria-hidden />Clear cart</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <ul className="space-y-3">
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} onQuantity={(n) => guard(cart.setQuantity(item.id, n))} onRemove={() => guard(cart.remove(item.id))} />
          ))}
        </ul>
        <OrderSummary items={cart.items}>
          {blocked && <p role="alert" className="mb-3 text-xs font-semibold text-brand-700">Fix the items marked above before checking out.</p>}
          <ButtonLink to="/checkout" fullWidth aria-disabled={blocked} onClick={(e) => blocked && e.preventDefault()}>Proceed to checkout</ButtonLink>
          <Link to="/" className="mt-3 block text-center text-sm font-semibold text-slate-700 hover:text-brand-700">Continue shopping</Link>
        </OrderSummary>
      </div>
    </div>
  );
}
