import { Home, Package, UserRound, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

const TABS = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/flash-sales', label: 'Flash', Icon: Zap },
  { to: '/orders', label: 'Orders', Icon: Package },
  { to: '/account', label: 'Account', Icon: UserRound },
];

/** Thumb-reach navigation for phones. Hidden from md up where the top bar has the same links. */
export function BottomNav() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold outline-none focus-visible:bg-slate-100', isActive ? 'text-brand-700' : 'text-slate-600')}>
          <Icon className="size-5" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
