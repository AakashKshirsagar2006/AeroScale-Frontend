import { Link } from 'react-router-dom';
import { cn } from '../lib/cn';
import { Spinner } from './Spinner';

const VARIANTS = {
  primary:
    'bg-brand text-white shadow-[0_10px_28px_-10px_rgba(239,68,68,0.8)] hover:bg-brand-600 focus-visible:ring-brand/40',
  secondary: 'border border-slate-200 bg-white text-ink hover:bg-slate-50 focus-visible:ring-accent/30',
  ghost: 'text-slate-700 hover:bg-slate-200/70 focus-visible:ring-accent/30',
};
const SIZES = { md: 'h-12 px-5', sm: 'h-10 px-4' };

/** Class string for anything that should LOOK like a button (links included). */
export const buttonClass = ({ variant = 'primary', size = 'md', fullWidth = false, className } = {}) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold outline-none',
    'transition focus-visible:ring-4 aria-disabled:pointer-events-none aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60',
    SIZES[size], VARIANTS[variant], fullWidth && 'w-full', className,
  );

export function Button({ variant, size, fullWidth, loading = false, type = 'button', disabled, className, children, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export const ButtonLink = ({ variant, size, fullWidth, className, ...props }) => (
  <Link className={buttonClass({ variant, size, fullWidth, className })} {...props} />
);
