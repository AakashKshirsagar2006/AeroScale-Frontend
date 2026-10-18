import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

const TABS = [
  { id: 'login', to: '/login', label: 'Login' },
  { id: 'register', to: '/register', label: 'Sign Up' },
];

/** Real links (not buttons) so back/forward and deep links work. `linkState` carries the "return to" page across tabs. */
export function AuthTabs({ active, linkState }) {
  return (
    <nav aria-label="Account" className="relative mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out',
          active === 'register' && 'translate-x-full',
        )}
      />
      {TABS.map((t) => (
        <Link
          key={t.id}
          to={t.to}
          state={linkState}
          aria-current={active === t.id ? 'page' : undefined}
          className={cn(
            'relative z-10 rounded-lg py-2.5 text-center text-sm font-semibold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-accent/30',
            active === t.id ? 'text-ink' : 'text-slate-600 hover:text-ink',
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
