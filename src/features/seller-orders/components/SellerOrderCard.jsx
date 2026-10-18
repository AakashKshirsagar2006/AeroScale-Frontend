import { Check, MapPin, PackageCheck, Phone, Truck } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatDate, formatPrice, plural } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { ProductImage } from '@/shared/ui/ProductImage';
import { SellerOrderStatusBadge } from './SellerOrderStatusBadge';

const STEPS = [['CONFIRMED', 'Paid'], ['SHIPPED', 'Shipped'], ['DELIVERED', 'Delivered']];
const NEXT = {
  CONFIRMED: { status: 'SHIPPED', label: 'Mark as shipped', Icon: Truck },
  SHIPPED: { status: 'DELIVERED', label: 'Mark as delivered', Icon: PackageCheck },
};

function Progress({ status }) {
  if (status === 'CANCELLED') return null;
  const at = STEPS.findIndex(([s]) => s === status);
  return (
    <ol aria-label="Order progress" className="flex items-center gap-2 px-4 py-3 sm:px-5">
      {STEPS.map(([key, label], i) => (
        <li key={key} className="flex flex-1 items-center gap-2 last:flex-none">
          <span className={cn('grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition', i <= at ? 'bg-success text-white' : 'bg-slate-200 text-slate-600')}>
            {i <= at ? <Check className="size-3.5" aria-hidden /> : i + 1}
          </span>
          <span className={cn('text-xs font-semibold', i <= at ? 'text-ink' : 'text-slate-500')}>{label}</span>
          {i < STEPS.length - 1 && <span aria-hidden className={cn('h-0.5 flex-1 rounded-full transition-colors', i < at ? 'bg-success' : 'bg-slate-200')} />}
        </li>
      ))}
    </ol>
  );
}

/** `busy` shows the spinner on the action button. `onAdvance(order, nextStatus)` returns a promise. */
export function SellerOrderCard({ order, onAdvance, busy = false }) {
  const next = NEXT[order.status];
  const { item } = order;
  const a = order.address;
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">
        <div>
          {order.createdAt && <p className="text-xs text-slate-600">Received {formatDate(order.createdAt)}</p>}
          <p className="font-mono text-xs text-slate-500">Order #{order.id.slice(0, 8)}</p>
        </div>
        <SellerOrderStatusBadge status={order.status} />
      </header>

      <Progress status={order.status} />

      <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-4 sm:px-5">
        <div className="size-16 shrink-0 overflow-hidden rounded-xl"><ProductImage src={item.imageUrl} name={item.name} /></div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
          <p className="text-xs text-slate-600">{formatPrice(item.unitPrice)} x {item.quantity}</p>
        </div>
        <p className="text-sm font-bold text-ink">{formatPrice(item.subTotal)}</p>
      </div>

      {a && (
        <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-700 sm:px-5">
          <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-500" aria-hidden /><span><strong className="text-ink">{a.recipientName}</strong>, {a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}, {a.city}, {a.state} {a.pincode}</span></p>
          {a.recipientPhoneNo && <p className="flex items-center gap-2"><Phone className="size-3.5 text-slate-500" aria-hidden />{a.recipientPhoneNo}</p>}
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:px-5">
        <div>
          <p className="text-xs text-slate-600">You earn · {plural(item.quantity, 'unit')}</p>
          <p className="text-lg font-extrabold text-ink">{formatPrice(order.total)}</p>
        </div>
        {next && <Button size="sm" onClick={() => onAdvance(order, next.status)} loading={busy}><next.Icon className="size-4" aria-hidden />{next.label}</Button>}
      </footer>
    </article>
  );
}
