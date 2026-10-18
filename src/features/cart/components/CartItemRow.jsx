import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/shared/lib/format';
import { ProductImage } from '@/shared/ui/ProductImage';
import { QuantityStepper } from '@/shared/ui/QuantityStepper';

export const maxFor = (item) => Math.max(0, Math.min(item.stock ?? 99, item.maxPerUser ?? 99));

export function CartItemRow({ item, onQuantity, onRemove }) {
  const max = maxFor(item);
  const over = item.stock != null && item.count > item.stock;
  const capped = item.maxPerUser != null && item.count >= item.maxPerUser;
  return (
    <li className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <Link to={`/product/${item.productId}`} className="size-20 shrink-0 overflow-hidden rounded-xl sm:size-24">
        <ProductImage src={item.imageUrl} name={item.name} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/product/${item.productId}`} className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand-700">{item.name}</Link>
            <p className="mt-1 text-sm text-slate-700">
              {formatPrice(item.unitPrice)}
              {item.originalPrice != null && <s className="ml-2 text-slate-500">{formatPrice(item.originalPrice)}</s>}
              {item.originalPrice != null && <span className="ml-2 rounded-md bg-brand/10 px-1.5 py-0.5 text-xs font-semibold text-brand-700">Flash price</span>}
            </p>
          </div>
          <button type="button" onClick={onRemove} aria-label={`Remove ${item.name}`} className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 outline-none hover:bg-brand/10 hover:text-brand-700 focus-visible:ring-4 focus-visible:ring-brand/30">
            <Trash2 className="size-[18px]" aria-hidden />
          </button>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper size="sm" value={item.count} max={Math.max(max, 1)} onChange={onQuantity} label={`Quantity of ${item.name}`} />
          <p className="text-base font-bold text-ink">{formatPrice(item.unitPrice * item.count)}</p>
        </div>
        {over && <p role="alert" className="text-xs font-semibold text-brand-700">Only {item.stock} in stock. Reduce the quantity to continue.</p>}
        {!over && capped && <p className="text-xs text-slate-600">Limit of {item.maxPerUser} per customer during this sale.</p>}
      </div>
    </li>
  );
}
