import { PackageOpen } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { useProfile } from '@/features/account';
import { OrderCard, orderApi, payOrder } from '@/features/orders';
import { parseApiError } from '@/shared/http/errors';
import { useInfiniteList } from '@/shared/lib/useInfiniteList';
import { Button, ButtonLink } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Modal } from '@/shared/ui/Modal';
import { Skeleton } from '@/shared/ui/Skeleton';
import { toast } from '@/shared/ui/toast';

export default function OrdersPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const list = useInfiniteList((page) => orderApi.list({ page, size: 6 }), []);
  const [busy, setBusy] = useState({}); // orderId -> 'pay' | 'cancel'
  const [confirming, setConfirming] = useState(null);

  const run = async (order, kind, action, doneMessage) => {
    setBusy((b) => ({ ...b, [order.id]: kind }));
    try { await action(); if (doneMessage) toast.success(doneMessage); list.reload(); }
    catch (err) { toast.error(parseApiError(err).message); }
    finally { setBusy((b) => ({ ...b, [order.id]: null })); }
  };
  const pay = (order) => run(order, 'pay', () => payOrder(order, { name: profile?.fullName, email: user.email }), 'Payment received');
  const cancel = (order) => { setConfirming(null); return run(order, 'cancel', () => orderApi.cancel(order.id), 'Order cancelled'); };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-ink">My orders</h1>

      {list.status === 'loading' && <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>}
      {list.status === 'error' && <ErrorState error={list.error} onRetry={list.reload} title="Could not load your orders" />}
      {list.status === 'ready' && !list.items.length && (
        <EmptyState icon={PackageOpen} title="No orders yet" text="When you place an order it shows up here, with its status." action={<ButtonLink to="/">Start shopping</ButtonLink>} />
      )}

      <div className="space-y-4">
        {list.items.map((order) => <OrderCard key={order.id} order={order} busy={busy[order.id] ?? null} onPay={pay} onCancel={setConfirming} />)}
      </div>
      {list.loadingMore && <Skeleton className="mt-4 h-48 rounded-2xl" />}
      {list.status === 'ready' && list.hasMore && <div ref={list.sentinelRef} aria-hidden className="h-px" />}

      <Modal open={Boolean(confirming)} onClose={() => setConfirming(null)} title="Cancel this order?">
        <p className="text-sm leading-relaxed text-slate-700">The items we are holding for you go back on sale. You can place a new order any time.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirming(null)}>Keep order</Button>
          <Button onClick={() => cancel(confirming)}>Yes, cancel it</Button>
        </div>
      </Modal>
    </div>
  );
}
