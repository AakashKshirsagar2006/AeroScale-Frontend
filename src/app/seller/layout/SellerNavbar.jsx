import { Plus } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { buttonClass } from '@/shared/ui/Button';
import { Logo } from '@/shared/ui/Logo';
import { SellerAccountMenu } from './SellerAccountMenu';
import { SELLER_LINKS } from './SellerNav';

export function SellerNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/seller" aria-label="Seller dashboard" className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
          <Logo />
          <span className="hidden rounded-md bg-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white sm:inline">Seller</span>
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {SELLER_LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-accent/30', isActive ? 'bg-brand/10 text-brand-700' : 'text-slate-700 hover:bg-slate-100')}>{label}</NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link to="/seller/products/new" className={buttonClass({ size: 'sm', className: 'hidden sm:inline-flex' })}><Plus className="size-4" aria-hidden />Add product</Link>
          <SellerAccountMenu />
        </div>
      </div>
    </header>
  );
}
