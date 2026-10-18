import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { SELLER_LINKS } from './SellerNav';

/** Thumb-reach navigation for phones. Hidden from md up, where the top bar has the same links. */
export function SellerBottomNav() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      {SELLER_LINKS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold outline-none focus-visible:bg-slate-100', isActive ? 'text-brand-700' : 'text-slate-600')}>
          <Icon className="size-5" aria-hidden />{label.split(' ')[0]}
        </NavLink>
      ))}
    </nav>
  );
}
