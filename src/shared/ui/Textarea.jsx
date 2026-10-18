import { forwardRef, useId } from 'react';
import { cn } from '../lib/cn';

/** Same look and the same react-hook-form behaviour as Input. `counter` = { value, max } shows "120 / 5000". */
export const Textarea = forwardRef(function Textarea({ label, error, hint, counter, className, id, rows = 5, ...props }, ref) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const noteId = `${fieldId}-note`;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label htmlFor={fieldId} className="block text-sm font-medium text-slate-800">{label}</label>}
      <textarea
        id={fieldId}
        ref={ref}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? noteId : undefined}
        className={cn(
          'w-full resize-y rounded-xl border bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4',
          error ? 'border-brand focus:border-brand focus:ring-brand/15' : 'border-slate-200 focus:border-accent focus:ring-accent/15',
        )}
        {...props}
      />
      <div className="flex items-start justify-between gap-3">
        <p id={noteId} role={error ? 'alert' : undefined} className={cn('text-xs', error ? 'font-medium text-brand-700' : 'text-slate-600')}>{error || hint}</p>
        {counter && (
          <span className={cn('shrink-0 text-xs tabular-nums', counter.value > counter.max ? 'font-semibold text-brand-700' : 'text-slate-500')}>{counter.value} / {counter.max}</span>
        )}
      </div>
    </div>
  );
});
