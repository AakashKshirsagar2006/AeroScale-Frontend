import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { cn } from '../lib/cn';
import { useStore } from '../lib/createStore';
import { toastStore } from './toast';

const KINDS = {
  success: { Icon: CircleCheck, tone: 'text-success' },
  error: { Icon: CircleAlert, tone: 'text-brand' },
  info: { Icon: Info, tone: 'text-accent' },
};

/** Mount once near the app root. */
export function Toaster() {
  const { toasts } = useStore(toastStore);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
      {toasts.map(({ id, kind, message }) => {
        const { Icon, tone } = KINDS[kind];
        return (
          <div key={id} role="status" className="pointer-events-auto flex max-w-sm animate-enter items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-2xl shadow-slate-900/30">
            <Icon className={cn('size-5 shrink-0', tone)} aria-hidden />
            {message}
          </div>
        );
      })}
    </div>
  );
}
