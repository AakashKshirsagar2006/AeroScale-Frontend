import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

/** Native <select> dressed like Input. Pass <option>s as children. Works with register(). */
export const Select = forwardRef(function Select({ label, error, hint, className, id, children, ...props }, ref) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const noteId = `${fieldId}-note`;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label htmlFor={fieldId} className="block text-sm font-medium text-slate-800">{label}</label>}
      <div className="relative">
        <select
          id={fieldId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? noteId : undefined}
          className={cn(
            'h-12 w-full appearance-none rounded-xl border bg-slate-50 pl-3.5 pr-10 text-sm text-ink outline-none transition focus:bg-white focus:ring-4',
            error ? 'border-brand focus:border-brand focus:ring-brand/15' : 'border-slate-200 focus:border-accent focus:ring-accent/15',
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
      </div>
      {(error || hint) && <p id={noteId} role={error ? 'alert' : undefined} className={cn('text-xs', error ? 'font-medium text-brand-700' : 'text-slate-600')}>{error || hint}</p>}
    </div>
  );
});
