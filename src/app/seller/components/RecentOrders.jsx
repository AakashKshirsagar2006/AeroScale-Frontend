import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SellerOrderStatusBadge } from '@/features/seller-orders';
import { formatDate, formatPrice } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui/Skeleton';

export function RecentOrders({ orders, loading }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Recent orders</h2>
        <Link to="/seller/orders" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-brand-700 outline-none hover:bg-brand/10 focus-visible:ring-4 focus-visible:ring-brand/30">View all<ChevronRight className="size-4" aria-hidden /></Link>
      </div>
      {loading && <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>}
      {!loading && !orders.length && <p className="py-6 text-center text-sm text-slate-600">No orders yet. They show up here the moment someone buys.</p>}
      <ul className="divide-y divide-slate-100">
        {orders.map((o) => (
          <li key={o.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{o.item.name}{o.item.quantity > 1 ? ` x ${o.item.quantity}` : ''}</p>
              <p className="text-xs text-slate-600">{o.address?.recipientName}{o.createdAt ? ` · ${formatDate(o.createdAt)}` : ''}</p>
            </div>
            <SellerOrderStatusBadge status={o.status} />
            <p className="w-24 text-right text-sm font-bold tabular-nums text-ink">{formatPrice(o.total)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
