import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductForm, sellerProductApi } from '@/features/seller-products';
import { useAsync } from '@/shared/lib/useAsync';
import { ErrorState } from '@/shared/ui/ErrorState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { toast } from '@/shared/ui/toast';

/** One page for "Add product" (no id) and "Edit product" (/:id/edit). */
export default function ProductEditorPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const product = useAsync(() => (editing ? sellerProductApi.get(id) : Promise.resolve(null)), [id]);
  const back = () => navigate('/seller/products');

  const submit = async ({ values, image }) => {
    if (editing) {
      await sellerProductApi.update(id, values, image);
      toast.success('Product updated');
      return back();
    }
    const created = await sellerProductApi.create(values, image);
    const stock = Number(values.initialStock);
    if (stock > 0) {
      try { await sellerProductApi.restock(created.id, stock); }
      catch { toast.error('Product saved, but the stock could not be added. Add it from the product list.'); return back(); }
    }
    toast.success(values.status === 'ACTIVE' ? 'Product is live' : 'Product saved');
    return back();
  };

  return (
    <div>
      <Link to="/seller/products" className="mb-4 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-slate-700 outline-none hover:text-brand-700 focus-visible:ring-4 focus-visible:ring-accent/30"><ArrowLeft className="size-4" aria-hidden />Back to products</Link>
      <PageHeader title={editing ? 'Edit product' : 'Add a product'} subtitle={editing ? 'Change anything and save. Buyers see the update straight away.' : 'Fill in the details. The preview on the right is what buyers will see.'} />

      {product.status === 'loading' && <div className="grid gap-8 lg:grid-cols-[1fr_20rem]"><Skeleton className="h-96 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>}
      {product.status === 'error' && <ErrorState error={product.error} onRetry={product.reload} title="Could not load this product" />}
      {product.status === 'ready' && <ProductForm initial={product.data ?? undefined} onSubmit={submit} onCancel={back} />}
    </div>
  );
}
