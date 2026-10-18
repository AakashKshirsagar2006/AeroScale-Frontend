import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export const SORTS = [
  { value: 'createdAt,desc', label: 'Newest first' },
  { value: 'price,asc', label: 'Price: low to high' },
  { value: 'price,desc', label: 'Price: high to low' },
  { value: 'name,asc', label: 'Name: A to Z' },
];

const field = 'h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-ink outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15';

/** Controlled. `value` = { sort, minPrice, maxPrice, inStock }. The page debounces and refetches. */
export function FilterBar({ value, onChange, className }) {
  const set = (patch) => onChange({ ...value, ...patch });
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)} role="group" aria-label="Filter products">
      <span className="hidden items-center gap-2 text-sm font-semibold text-slate-700 sm:flex">
        <SlidersHorizontal className="size-4" aria-hidden /> Filters
      </span>
      <label className="sr-only" htmlFor="sort">Sort by</label>
      <select id="sort" value={value.sort} onChange={(e) => set({ sort: e.target.value })} className={cn(field, 'pr-8')}>
        {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="min-price">Minimum price</label>
        <input id="min-price" inputMode="numeric" placeholder="Min ₹" value={value.minPrice} onChange={(e) => set({ minPrice: e.target.value.replace(/\D/g, '') })} className={cn(field, 'w-24')} />
        <span className="text-slate-400" aria-hidden>to</span>
        <label className="sr-only" htmlFor="max-price">Maximum price</label>
        <input id="max-price" inputMode="numeric" placeholder="Max ₹" value={value.maxPrice} onChange={(e) => set({ maxPrice: e.target.value.replace(/\D/g, '') })} className={cn(field, 'w-24')} />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
        <input type="checkbox" checked={value.inStock} onChange={(e) => set({ inStock: e.target.checked })} className="size-4 rounded border-slate-300 accent-brand" />
        In stock only
      </label>
    </div>
  );
}
