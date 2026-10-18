import { formatPrice } from '@/shared/lib/format';
import { ProductImage } from '@/shared/ui/ProductImage';
import { ProductStatusBadge } from './ProductStatusBadge';

/** What the product card will look like to buyers, updating as the seller types. */
export function ProductPreview({ name, price, description, imageUrl, status }) {
  const n = Number(price);
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Live preview</p>
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="relative aspect-square">
          <ProductImage src={imageUrl} name={name || 'Product'} />
          <ProductStatusBadge status={status} className="absolute left-3 top-3 shadow" />
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink">{name || 'Your product name'}</h3>
          <p className="text-lg font-extrabold tracking-tight text-ink">{n > 0 ? formatPrice(n) : '₹0'}</p>
          <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">{description || 'Your description shows up on the product page.'}</p>
          <div className="mt-2 grid h-10 place-items-center rounded-xl bg-ink text-sm font-semibold text-white">Add to cart</div>
        </div>
      </article>
    </div>
  );
}
