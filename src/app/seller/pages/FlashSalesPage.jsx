import { Plus, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSellerProfile } from '@/features/seller';
import { ScheduleSaleForm, SellerSaleCard, sellerSaleApi } from '@/features/seller-flash-sales';
import { sellerProductApi } from '@/features/seller-products';
import { parseApiError } from '@/shared/http/errors';
import { useInfiniteList } from '@/shared/lib/useInfiniteList';
import { usePatches } from '@/shared/lib/usePatches';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Modal } from '@/shared/ui/Modal';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Tabs } from '@/shared/ui/Tabs';
import { toast } from '@/shared/ui/toast';

const TABS = [
  { value: 'ALL', label: 'All' }, { value: 'ACTIVE', label: 'Live' }, { value: 'SCHEDULED', label: 'Upcoming' },
  { value: 'ENDED', label: 'Ended' }, { value: 'CANCELLED', label: 'Cancelled' },
];

export default function FlashSalesPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'ALL';
  const wantsNew = params.has('new');
  const presetProduct = params.get('new') ?? '';
  const { profile } = useSellerProfile();
  const [products, setProducts] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [busy, setBusy] = useState(false);
  const { patch, apply, reset } = usePatches();

  const list = useInfiniteList((page) => sellerSaleApi.list({ page, size: 8, status: tab === 'ALL' ? undefined : tab }), [tab]);
  useEffect(() => { reset(); }, [tab, reset]);

  // Only fetched when the dialog opens: the product list is not needed to browse sales.
  useEffect(() => {
    if (!wantsNew || products) return;
    sellerProductApi.list({ status: 'ACTIVE', size: 50 }).then((r) => setProducts(r.items), () => { setProducts([]); toast.error('Could not load your products'); });
  }, [wantsNew, products]);

  const closeForm = () => { const next = new URLSearchParams(params); next.delete('new'); setParams(next, { replace: true }); };
  const schedule = async (values) => {
    await sellerSaleApi.schedule(values);
    toast.success('Flash sale scheduled');
    closeForm();
    list.reload();
  };
  const cancel = async () => {
    setBusy(true);
    try { await sellerSaleApi.cancel(cancelling.id); patch(cancelling.id, { status: 'CANCELLED' }); toast.success('Sale cancelled'); }
    catch (e) { toast.error(parseApiError(e).message); }
    setBusy(false); setCancelling(null);
  };

  const items = apply(list.items).filter((s) => tab === 'ALL' || s.status === tab);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Flash sales" subtitle="Set aside some stock, pick a price and a time window. Buyers see the countdown on the home page."
        actions={<Button onClick={() => setParams({ new: '' })}><Plus className="size-4" aria-hidden />Schedule a sale</Button>} />
      <Tabs className="mb-6" tabs={TABS} value={tab} label="Sale status" onChange={(v) => setParams(v === 'ALL' ? {} : { tab: v })} />

      {list.status === 'loading' && <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>}
      {list.status === 'error' && <ErrorState error={list.error} onRetry={list.reload} title="Could not load your flash sales" />}
      {list.status === 'ready' && !items.length && (
        <EmptyState icon={Zap} title="No flash sales here" text="Run a limited-time deal to bring in buyers fast." action={<Button onClick={() => setParams({ new: '' })}>Schedule a sale</Button>} />
      )}
      <div className="space-y-4">{items.map((s) => <SellerSaleCard key={s.id} sale={s} onCancel={setCancelling} />)}</div>
      {list.loadingMore && <Skeleton className="mt-4 h-32 rounded-2xl" />}
      {list.status === 'ready' && list.hasMore && <div ref={list.sentinelRef} aria-hidden className="h-px" />}

      <Modal open={wantsNew} onClose={closeForm} title="Schedule a flash sale">
        {products == null ? <Skeleton className="h-72" /> : (
          <ScheduleSaleForm products={products} initialProductId={presetProduct} slots={profile?.flashSaleSlots ?? 5} onSubmit={schedule} onCancel={closeForm} />
        )}
      </Modal>
      <ConfirmDialog open={Boolean(cancelling)} onClose={() => setCancelling(null)} onConfirm={cancel} busy={busy} title="Cancel this sale?" confirmLabel="Cancel sale" cancelLabel="Keep it"
        text="It will not start, and the units you set aside go back to regular stock." />
    </div>
  );
}
