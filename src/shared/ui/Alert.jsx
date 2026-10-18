import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { cn } from '../lib/cn';

const VARIANTS = {
  error: { box: 'border-brand/30 bg-brand/10 text-red-900 animate-shake', Icon: CircleAlert, icon: 'text-brand-600' },
  warning: { box: 'border-amber-400/50 bg-amber-100 text-amber-950', Icon: TriangleAlert, icon: 'text-amber-600' },
  info: { box: 'border-accent/30 bg-accent/10 text-slate-900', Icon: Info, icon: 'text-accent' },
  success: { box: 'border-success/30 bg-success/10 text-emerald-900', Icon: CircleCheck, icon: 'text-success' },
};

/** Give it a changing `key` to replay the shake on repeated errors. */
export function Alert({ variant = 'info', className, children }) {
  const { box, Icon, icon } = VARIANTS[variant];
  return (
    <div role="alert" className={cn('flex items-start gap-3 rounded-xl border px-4 py-3 text-sm', box, className)}>
      <Icon className={cn('mt-0.5 size-[18px] shrink-0', icon)} aria-hidden />
      <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
    </div>
  );
}
