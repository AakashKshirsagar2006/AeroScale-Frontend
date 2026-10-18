import { Link } from 'react-router-dom';
import { PriceTag, SaleTimer } from '@/features/catalog';
import { ButtonLink } from '@/shared/ui/Button';
import { ProductImage } from '@/shared/ui/ProductImage';
import { Skeleton } from '@/shared/ui/Skeleton';

const FLOATS = [
  'left-0 top-0 -rotate-3',
  'right-0 top-24 rotate-2 [animation-delay:-3.5s]',
  'left-10 top-52 rotate-1 [animation-delay:-1.8s]',
];

function MiniDeal({ item, pos }) {
  return (
    <Link to={`/product/${item.id}`} className={`absolute flex w-72 animate-float items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 outline-none transition hover:shadow-2xl focus-visible:ring-4 focus-visible:ring-accent/40 ${pos}`}>
      <div className="size-14 shrink-0 overflow-hidden rounded-xl"><ProductImage src={item.imageUrl} name={item.name} /></div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
        <PriceTag item={item} />
      </div>
      <span className="ml-auto shrink-0 rounded-md bg-brand px-1.5 py-0.5 text-xs font-bold text-white">{item.flashSale.discountPercent}%</span>
    </Link>
  );
}

/** `items` = live sales, soonest-ending first. The timer shown is the one that runs out next. */
export function HeroBanner({ items, loading }) {
  const lead = items[0];
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-rose-50 to-red-100/70 p-6 sm:p-10 lg:p-12">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-[420px] rounded-full bg-brand/20 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 size-[360px] rounded-full bg-accent/15 blur-[110px]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
            <span className="size-2 animate-glow rounded-full bg-brand" />
            {lead ? 'Flash sale is live' : 'Fresh drops every day'}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Today&rsquo;s<br /><span className="text-brand">Flash Deals</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-700">Limited time. Limited stock. Real savings.</p>

          <div className="mt-6 min-h-11">
            {loading ? <Skeleton className="h-11 w-72" /> : lead && <SaleTimer flashSale={lead.flashSale} size="lg" />}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink to="/flash-sales">Shop flash sales</ButtonLink>
            <a href="#explore" className="inline-flex h-12 items-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-ink outline-none transition hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-accent/30">Browse everything</a>
          </div>
        </div>

        <div aria-label="Deals ending soon" className="relative hidden h-80 lg:block">
          {items.slice(0, 3).map((item, i) => <MiniDeal key={item.id} item={item} pos={FLOATS[i]} />)}
        </div>
      </div>
    </section>
  );
}
