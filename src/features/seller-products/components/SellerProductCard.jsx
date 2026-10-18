import { Archive, PackagePlus, Pencil, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/shared/lib/format';
import { ProductImage } from '@/shared/ui/ProductImage';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ProductStatusBadge } from './ProductStatusBadge';
import { StockBar } from './StockBar';

const act = 'inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-700 outline-none transition hover:bg-slate-100 hover:text-ink focus-visible:ring-4 focus-visible:ring-accent/30';

/** The card never calls the API. The page passes the handlers. */
export function SellerProductCard({ product, onRestock, onArchive }) {
  const archived = product.status === 'ARCHIVED';
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <Link to={`/seller/products/${product.id}/edit`} aria-label={`Edit ${product.name}`} className="relative block aspect-square overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent/40">
        <div className={`size-full transition duration-500 group-hover:scale-105 ${archived ? 'opacity-50 grayscale' : ''}`}><ProductImage src={product.imageUrl} name={product.name} /></div>
        <ProductStatusBadge status={product.status} className="absolute left-3 top-3 shadow" />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink">
            <Link to={`/seller/products/${product.id}/edit`} className="outline-none hover:text-brand-700 focus-visible:underline">{product.name}</Link>
          </h3>
          <p className="mt-1.5 text-lg font-extrabold tracking-tight text-ink">{formatPrice(product.price)}</p>
        </div>
        <StockBar available={product.availableStock} total={product.totalStock} />

        <div className="mt-auto flex gap-1 border-t border-slate-100 pt-3">
          <Link to={`/seller/products/${product.id}/edit`} className={act}><Pencil className="size-3.5" aria-hidden />Edit</Link>
          {!archived && <button type="button" onClick={() => onRestock(product)} className={act}><PackagePlus className="size-3.5" aria-hidden />Stock</button>}
          {product.status === 'ACTIVE' && <Link to={`/seller/flash-sales?new=${product.id}`} className={`${act} hover:text-brand-700`}><Zap className="size-3.5" aria-hidden />Sale</Link>}
          {!archived && <button type="button" onClick={() => onArchive(product)} aria-label={`Archive ${product.name}`} className={`${act} flex-none px-3 hover:bg-brand/10 hover:text-brand-700`}><Archive className="size-3.5" aria-hidden /></button>}
        </div>
      </div>
    </article>
  );
}

export function SellerProductCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-3 p-4"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-8 w-full" /><Skeleton className="h-9 w-full" /></div>
    </div>
  );
}
