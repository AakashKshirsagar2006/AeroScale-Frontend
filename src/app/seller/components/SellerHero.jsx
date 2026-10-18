import { Plus, Star, Zap } from 'lucide-react';
import { ButtonLink } from '@/shared/ui/Button';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { Skeleton } from '@/shared/ui/Skeleton';
import { formatPrice } from '@/shared/lib/format';
import { VerificationBadge } from '@/features/seller';

const FLOATS = [
  'left-0 top-0 -rotate-3',
  'right-0 top-24 rotate-2 [animation-delay:-3.5s]',
  'left-10 top-52 rotate-1 [animation-delay:-1.8s]',
];

function Floater({ label, children, pos }) {
  return (
    <div className={`absolute w-64 animate-float rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 ${pos}`}>
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <div className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{children}</div>
    </div>
  );
}

/** Same gradient hero as the buyer's home, with the seller's headline numbers floating beside it. */
export function SellerHero({ profile, loading }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-rose-50 to-red-100/70 p-6 sm:p-10 lg:p-12">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-[420px] rounded-full bg-brand/20 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 size-[360px] rounded-full bg-accent/15 blur-[110px]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {loading || !profile ? <Skeleton className="h-8 w-44 rounded-full" /> : <VerificationBadge status={profile.verification} className="border border-white bg-white shadow-sm" />}
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Welcome back,<br />
            {loading || !profile ? <Skeleton className="mt-2 h-12 w-72" /> : <span className="text-brand">{profile.businessName}</span>}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-700">Here is how your store is doing. Add products, run flash sales and keep an eye on every order.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink to="/seller/products/new"><Plus className="size-4" aria-hidden />Add product</ButtonLink>
            <ButtonLink to="/seller/flash-sales?new=" variant="secondary"><Zap className="size-4" aria-hidden />Schedule a flash sale</ButtonLink>
          </div>
        </div>

        <div aria-label="Store highlights" className="relative hidden h-80 lg:block">
          {profile && (
            <>
              <Floater label="Total revenue" pos={FLOATS[0]}><AnimatedNumber value={profile.totalRevenue} format={(n) => formatPrice(Math.round(n))} /></Floater>
              <Floater label="Orders" pos={FLOATS[1]}><AnimatedNumber value={profile.totalOrders} /></Floater>
              <Floater label="Store rating" pos={FLOATS[2]}><span className="flex items-center gap-2"><Star className="size-6 fill-amber-400 text-amber-400" aria-hidden />{profile.rating ? profile.rating.toFixed(1) : 'New'}</span></Floater>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
