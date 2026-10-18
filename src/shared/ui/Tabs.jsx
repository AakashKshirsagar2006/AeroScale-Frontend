import { cn } from '../lib/cn';

/** Pill tabs, same look as the buyer's account tabs. `tabs` = [{ value, label, count? }]. Controlled. */
export function Tabs({ tabs, value, onChange, label = 'Sections', className }) {
  return (
    <div role="tablist" aria-label={label} className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-200/70 p-1 [scrollbar-width:none]', className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-accent/30',
            value === t.value ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink',
          )}
        >
          {t.label}
          {t.count != null && <span className="ml-1.5 text-xs font-bold text-brand-700">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
