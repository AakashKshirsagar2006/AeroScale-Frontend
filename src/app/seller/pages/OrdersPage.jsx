import { ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SellerOrderCard, sellerOrderApi } from '@/features/seller-orders';
import { parseApiError } from '@/shared/http/errors';
import { useInfiniteList } from '@/shared/lib/useInfiniteList';
import { usePatches } from '@/shared/lib/usePatches';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Tabs } from '@/shared/ui/Tabs';
import { toast } from '@/shared/ui/toast';

const TABS = [
  { value: 'ALL', label: 'All' }, { value: 'CONFIRMED', label: 'To ship' }, { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' }, { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'ALL';
  const [busy, setBusy] = useState({});
  const { patch, apply, reset } = usePatches();

  const list = useInfiniteList((page) => sellerOrderApi.list({ page, size: 6, status: tab === 'ALL' ? undefined : tab }), [tab]);
  useEffect(() => { reset(); }, [tab, reset]);

  const advance = async (order, status) => {
    setBusy((b) => ({ ...b, [order.id]: true }));
    try {
      await sellerOrderApi.updateStatus(order.id, status);
      patch(order.id, { status });
      toast.success(status === 'SHIPPED' ? 'Marked as shipped' : 'Marked as delivered');
    } catch (e) { toast.error(parseApiError(e).message); }
    setBusy((b) => ({ ...b, [order.id]: false }));
  };

  // After a status change an order no longer belongs to a filtered tab, so hide it from there.
  const items = apply(list.items).filter((o) => tab === 'ALL' || o.status === tab);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Orders" subtitle="Paid orders for your products. Ship them and keep buyers updated." />
      <Tabs className="mb-6" tabs={TABS} value={tab} label="Order status" onChange={(v) => setParams(v === 'ALL' ? {} : { tab: v })} />

      {list.status === 'loading' && <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>}
      {list.status === 'error' && <ErrorState error={list.error} onRetry={list.reload} title="Could not load your orders" />}
      {list.status === 'ready' && !items.length && <EmptyState icon={ClipboardList} title="No orders here" text={tab === 'ALL' ? 'Orders show up here as soon as a buyer pays.' : 'Nothing in this list right now.'} />}

      <div className="space-y-4">{items.map((o) => <SellerOrderCard key={o.id} order={o} busy={Boolean(busy[o.id])} onAdvance={advance} />)}</div>
      {list.loadingMore && <Skeleton className="mt-4 h-56 rounded-2xl" />}
      {list.status === 'ready' && list.hasMore && <div ref={list.sentinelRef} aria-hidden className="h-px" />}
    </div>
  );
}
