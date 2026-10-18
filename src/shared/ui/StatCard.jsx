import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/cn';
import { Skeleton } from './Skeleton';

const TONES = {
  brand: 'bg-brand/10 text-brand',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  amber: 'bg-amber-100 text-amber-700',
};

/** Percent change chip. `change` null = nothing to compare, renders nothing. */
export function DeltaChip({ change, className }) {
  if (change == null) return null;
  const up = change >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold', up ? 'bg-success/15 text-emerald-800' : 'bg-brand/10 text-brand-700', className)}>
      <Icon className="size-3.5" aria-hidden />{Math.abs(change).toFixed(change > 99 ? 0 : 1)}%
    </span>
  );
}

/** One KPI tile. `value` is already-rendered content (text or <AnimatedNumber/>). `children` = optional footer (sparkline...). */
export function StatCard({ label, value, Icon, tone = 'brand', change, hint, loading = false, children, className }) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {Icon && <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', TONES[tone])}><Icon className="size-5" aria-hidden /></span>}
      </div>
      {loading ? <Skeleton className="mt-3 h-9 w-32" /> : (
        <p className="mt-2 text-3xl font-extrabold tracking-tight text-ink tabular-nums">{value}</p>
      )}
      {!loading && (change != null || hint) && (
        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <DeltaChip change={change} />{hint}
        </p>
      )}
      {children}
    </div>
  );
}
