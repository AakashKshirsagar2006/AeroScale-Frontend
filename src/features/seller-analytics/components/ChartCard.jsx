import { cn } from '@/shared/lib/cn';

/** White card with a title row. Every chart on the analytics page sits in one. */
export function ChartCard({ title, subtitle, right, children, className }) {
  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white p-5 sm:p-6', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
