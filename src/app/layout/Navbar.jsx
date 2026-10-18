import { Search, ShoppingCart } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/features/cart';
import { cn } from '@/shared/lib/cn';
import { Logo } from '@/shared/ui/Logo';
import { AccountMenu } from './AccountMenu';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/flash-sales', label: 'Flash Sales' },
  { to: '/orders', label: 'Orders' },
];

function SearchBox({ className }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inputId = useId();
  const [term, setTerm] = useState(params.get('q') ?? '');
  useEffect(() => { setTerm(params.get('q') ?? ''); }, [params]);

  const submit = (e) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };
  return (
    <form role="search" onSubmit={submit} className={cn('relative', className)}>
      <label htmlFor={inputId} className="sr-only">Search products</label>
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-500" />
      <input
        id={inputId}
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search for products, brands and more"
        className="h-11 w-full rounded-full border border-transparent bg-slate-100 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-500 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
      />
    </form>
  );
}

export function Navbar() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="AeroScale home" className="shrink-0 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-accent/30"><Logo /></Link>

        <SearchBox className="hidden max-w-xl flex-1 md:block" />

        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-accent/30', isActive ? 'bg-brand/10 text-brand-700' : 'text-slate-700 hover:bg-slate-100')}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative grid size-10 place-items-center rounded-full text-ink outline-none transition hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-accent/30">
            <ShoppingCart className="size-[22px]" aria-hidden />
            {count > 0 && (
              <span key={count} className="absolute -right-0.5 -top-0.5 grid min-w-5 animate-pop place-items-center rounded-full bg-brand px-1 text-[11px] font-bold leading-5 text-white">{count > 99 ? '99+' : count}</span>
            )}
          </Link>
          <AccountMenu />
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden"><SearchBox className="mobile" /></div>
    </header>
  );
}
