import { formatCompactPrice, plural } from '@/shared/lib/format';
import { ProductImage } from '@/shared/ui/ProductImage';

/** Ranked list with a bar behind each row showing its share of the best seller's revenue. */
export function TopProducts({ products }) {
  const top = Math.max(1, ...products.map((p) => p.revenue));
  if (!products.length) return <p className="py-8 text-center text-sm text-slate-600">No sales in this period yet.</p>;
  return (
    <ol className="space-y-3">
      {products.map((p, i) => (
        <li key={p.id} className="relative flex items-center gap-3 overflow-hidden rounded-xl p-2">
          <span aria-hidden className="absolute inset-y-0 left-0 animate-fade rounded-xl bg-brand/8" style={{ width: `${(p.revenue / top) * 100}%` }} />
          <span className="relative grid size-6 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg"><ProductImage src={p.imageUrl} name={p.name} /></div>
          <div className="relative min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
            <p className="text-xs text-slate-600">{plural(p.units, 'unit')} sold</p>
          </div>
          <p className="relative text-sm font-extrabold tabular-nums text-ink">{formatCompactPrice(p.revenue)}</p>
        </li>
      ))}
    </ol>
  );
}
