import { cn } from '@/shared/lib/cn';

/** Available vs total units. Turns amber when low and red when gone. Shows a note if the backend sent no stock. */
export function StockBar({ available, total, className }) {
  if (available == null) return <p className={cn('text-xs text-slate-500', className)}>Stock not available</p>;
  const out = available <= 0;
  const low = !out && available <= 5;
  const pct = total ? Math.min(100, Math.round((available / total) * 100)) : out ? 0 : 100;
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs">
        <span className={cn('font-semibold', out ? 'text-brand-700' : low ? 'text-amber-800' : 'text-slate-700')}>{out ? 'Out of stock' : low ? `Only ${available} left` : `${available} in stock`}</span>
        {total != null && <span className="text-slate-500">{total} total</span>}
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Stock level">
        <div className={cn('h-full rounded-full transition-[width] duration-700', out ? 'bg-brand' : low ? 'bg-amber-400' : 'bg-linear-to-r from-success to-emerald-300')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
