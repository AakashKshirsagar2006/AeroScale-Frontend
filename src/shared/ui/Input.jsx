import { forwardRef, useId } from 'react';
import { cn } from '../lib/cn';

/** Works with react-hook-form's register() because it forwards the ref to the <input>. */
export const Input = forwardRef(function Input(
  { label, icon: Icon, right, error, hint, className, id, ...props }, ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const noteId = `${inputId}-note`;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-800">{label}</label>}
      <div className="relative">
        {Icon && <Icon aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? noteId : undefined}
          className={cn(
            'h-12 w-full rounded-xl border bg-slate-50 px-3.5 text-sm text-ink outline-none transition placeholder:text-slate-400',
            'focus:bg-white focus:ring-4', Icon && 'pl-10', right && 'pr-12',
            error ? 'border-brand focus:border-brand focus:ring-brand/15' : 'border-slate-200 focus:border-accent focus:ring-accent/15',
          )}
          {...props}
        />
        {right && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {(error || hint) && (
        <p id={noteId} role={error ? 'alert' : undefined} className={cn('text-xs', error ? 'font-medium text-brand-700' : 'text-slate-600')}>
          {error || hint}
        </p>
      )}
    </div>
  );
});
