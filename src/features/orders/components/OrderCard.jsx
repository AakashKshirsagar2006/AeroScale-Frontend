import { Loader2 } from 'lucide-react';
import { formatDate, formatPrice, plural } from '@/shared/lib/format';
import { useNow } from '@/shared/lib/useNow';
import { Button } from '@/shared/ui/Button';
import { ProductImage } from '@/shared/ui/ProductImage';
import { holdDeadline } from '../model/payOrder';
import { HoldTimer } from './HoldTimer';
import { OrderStatusBadge } from './OrderStatusBadge';

/** `busy` = 'pay' | 'cancel' | null so the right button shows its spinner. */
export function OrderCard({ order, onPay, onCancel, busy = null }) {
  const now = useNow();
  const pending = order.status === 'PENDING';
  const canPay = pending && holdDeadline(order) > now;
  const count = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs text-slate-600">Order placed {formatDate(order.createdAt)}</p>
          <p className="font-mono text-xs text-slate-500">#{order.id.slice(0, 8)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <ul className="divide-y divide-slate-100 px-4 sm:px-5">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-3.5">
            <div className="size-14 shrink-0 overflow-hidden rounded-xl"><ProductImage src={item.imageUrl} name={item.name} /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
              <p className="text-xs text-slate-600">{formatPrice(item.unitPrice)} x {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-ink">{formatPrice(item.subTotal)}</p>
          </li>
        ))}
      </ul>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:px-5">
        <div>
          <p className="text-xs text-slate-600">{plural(count, 'item')}</p>
          <p className="text-lg font-extrabold text-ink">{formatPrice(order.total)}</p>
        </div>
        {pending && (
          <div className="flex flex-wrap items-center gap-3">
            <HoldTimer order={order} />
            <Button variant="secondary" size="sm" onClick={() => onCancel(order)} disabled={busy !== null}>
              {busy === 'cancel' && <Loader2 className="size-4 animate-spin" aria-hidden />}Cancel
            </Button>
            <Button size="sm" onClick={() => onPay(order)} disabled={!canPay || busy !== null} loading={busy === 'pay'}>Pay now</Button>
          </div>
        )}
      </footer>
    </article>
  );
}
