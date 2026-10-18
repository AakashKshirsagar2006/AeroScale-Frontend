import { cn } from '@/shared/lib/cn';
import { soldPercent } from '../model/sale';

/** "82% claimed" bar for sale items. Renders nothing if the backend did not send quantities. */
export function StockMeter({ flashSale, availableStock, className }) {
  if (!flashSale?.totalQuantity) return null;
  const pct = soldPercent(flashSale);
  const hot = pct >= 80;
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs">
        <span className={cn('font-semibold', hot ? 'text-brand-700' : 'text-slate-700')}>{pct}% claimed</span>
        <span className="text-slate-600">
          {availableStock != null && availableStock <= 10 ? `Only ${availableStock} left` : `${flashSale.soldQuantity}/${flashSale.totalQuantity} sold`}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Sale stock claimed">
        <div className="h-full rounded-full bg-linear-to-r from-brand to-orange-400 transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
