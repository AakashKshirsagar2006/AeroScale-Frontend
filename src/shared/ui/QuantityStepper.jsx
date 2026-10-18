import { Minus, Plus } from 'lucide-react';
import { cn } from '../lib/cn';

export function QuantityStepper({ value, min = 1, max = 99, onChange, disabled, size = 'md', label = 'Quantity' }) {
  const sm = size === 'sm';
  const btn = cn(
    'grid place-items-center rounded-lg text-ink outline-none transition hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent',
    sm ? 'size-8' : 'size-10',
  );
  return (
    <div role="group" aria-label={label} className={cn('inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5', disabled && 'opacity-60')}>
      <button type="button" aria-label="Decrease quantity" disabled={disabled || value <= min} onClick={() => onChange(value - 1)} className={btn}>
        <Minus className="size-4" aria-hidden />
      </button>
      <span aria-live="polite" className={cn('text-center text-sm font-semibold tabular-nums text-ink', sm ? 'w-8' : 'w-10')}>{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} className={btn}>
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
