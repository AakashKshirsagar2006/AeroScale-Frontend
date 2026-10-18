import { Zap } from 'lucide-react';
import { cn } from '../lib/cn';

export function Logo({ onDark = false, className }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-brand/15 text-brand">
        <Zap className="size-5 fill-current" aria-hidden />
      </span>
      <span className={cn('text-xl font-extrabold tracking-tight', onDark ? 'text-white' : 'text-ink')}>
        Aero<span className="text-brand">Scale</span>
      </span>
    </div>
  );
}
