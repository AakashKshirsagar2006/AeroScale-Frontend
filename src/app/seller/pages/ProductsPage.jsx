import { PackagePlus, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid, SkeletonGrid } from '@/features/catalog';
import { RestockForm, SellerProductCard, sellerProductApi } from '@/features/seller-products';
import { parseApiError } from '@/shared/http/errors';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { useInfiniteList } from '@/shared/lib/useInfiniteList';
import { usePatches } from '@/shared/lib/usePatches';
import { Button, ButtonLink } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Modal } from '@/shared/ui/Modal';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Tabs } from '@/shared/ui/Tabs';
import { toast } from '@/shared/ui/toast';

const TABS = [{ value: 'ALL', label: 'All' }, { value: 'ACTIVE', label: 'Active' }, { value: 'DRAFT', label: 'Drafts' }, { value: 'ARCHIVED', label: 'Archived' }];
const SORTS = [['createdAt,desc', 'Newest first'], ['price,asc', 'Price: low to high'], ['price,desc', 'Price: high to low'], ['name,asc', 'Name: A to Z']];
const field = 'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.value === params.get('status')) ? params.get('status') : 'ALL';
  const [term, setTerm] = useState('');
  const q = useDebouncedValue(term.trim(), 400);
  const [sort, setSort] = useState('createdAt,desc');
  const [restocking, setRestocking] = useState(null);
  const [archiving, setArchiving] = useState(null);
  const [busy, setBusy] = useState(false);
  const { patch, apply, reset } = usePatches();

  const list = useInfiniteList(
    (page) => sellerProductApi.list({ page, size: 12, status: tab === 'ALL' ? undefined : tab, q, sort }),
    [tab, q, sort],
  );
  useEffect(() => { reset(); }, [tab, q, sort, reset]);

  const items = apply(list.items).filter((p) => tab === 'ALL' || p.status === tab);

  const restock = async (quantity) => {
    await sellerProductApi.restock(restocking.id, quantity);
    const total = (restocking.totalStock ?? 0) + quantity;
    const available = (restocking.availableStock ?? restocking.totalStock ?? 0) + quantity;
    patch(restocking.id, { totalStock: total, availableStock: available });
    toast.success(`Added ${quantity} units`);
    setRestocking(null);
  };
  const archive = async () => {
    setBusy(true);
    try { await sellerProductApi.archive(archiving.id); patch(archiving.id, { status: 'ARCHIVED' }); toast.success('Product archived'); }
    catch (e) { toast.error(parseApiError(e).message); }
    setBusy(false); setArchiving(null);
  };

  const emptyText = q ? `Nothing matches "${q}".` : tab === 'ALL' ? 'Add your first product and it can be on sale in a minute.' : 'Nothing here right now.';

  return (
    <div>
      <PageHeader title="Products" subtitle="Everything you sell. Edit details, top up stock or put a product on flash sale."
        actions={<ButtonLink to="/seller/products/new"><Plus className="size-4" aria-hidden />Add product</ButtonLink>} />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Tabs tabs={TABS} value={tab} label="Product status" onChange={(v) => setParams(v === 'ALL' ? {} : { status: v })} />
        <div className="relative ml-auto min-w-48 flex-1 sm:max-w-xs sm:flex-none">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search your products" aria-label="Search your products" className={`${field} w-full pl-9`} />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" className={field}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </div>

      {list.status === 'loading' && <SkeletonGrid count={8} />}
      {list.status === 'error' && <ErrorState error={list.error} onRetry={list.reload} title="Could not load your products" />}
      {list.status === 'ready' && !items.length && (
        <EmptyState icon={PackagePlus} title={q ? 'No products found' : 'No products yet'} text={emptyText} action={!q && <ButtonLink to="/seller/products/new">Add a product</ButtonLink>} />
      )}

      {items.length > 0 && (
        <ProductGrid>
          {items.map((p) => <SellerProductCard key={p.id} product={p} onRestock={setRestocking} onArchive={setArchiving} />)}
        </ProductGrid>
      )}
      {list.loadingMore && <SkeletonGrid count={4} className="mt-4" />}
      {list.error && list.items.length > 0 && <div className="mt-6 flex justify-center"><Button variant="secondary" onClick={list.retry}>Could not load more. Try again</Button></div>}
      {list.status === 'ready' && list.hasMore && <div ref={list.sentinelRef} aria-hidden className="h-px" />}

      <Modal open={Boolean(restocking)} onClose={() => setRestocking(null)} title="Add stock">
        {restocking && <RestockForm product={restocking} onSubmit={restock} onCancel={() => setRestocking(null)} />}
      </Modal>
      <ConfirmDialog open={Boolean(archiving)} onClose={() => setArchiving(null)} onConfirm={archive} busy={busy} title="Archive this product?" confirmLabel="Archive"
        text="Buyers will no longer see it. Past orders are not affected, and you can bring it back any time by editing it and setting it to Active." />
    </div>
  );
}
