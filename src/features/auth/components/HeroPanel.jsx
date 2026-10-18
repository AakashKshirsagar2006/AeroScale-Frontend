import { Fragment, useEffect, useState } from 'react';
import { Headphones, Smartphone } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useCountdown } from '@/shared/lib/useCountdown';

const SLIDES = [
  { lines: ['Flash Deals.', 'Real Scale.'], text: 'High performance shopping experience for everyone.' },
  { lines: ['Limited Time.', 'Limited Stock.'], text: 'Real savings, gone the moment the timer hits zero.' },
  { lines: ['Sell Fast.', 'Scale Faster.'], text: 'Launch a flash sale and reach thousands of buyers at once.' },
];

const DEALS = [
  { icon: Smartphone, name: 'iPhone 15', price: '₹49,999', was: '₹69,900', off: '28% off', sold: 82, pos: 'left-0 top-2 -rotate-3' },
  { icon: Headphones, name: 'Sony WH-1000XM5', price: '₹24,999', was: '₹34,990', off: '29% off', sold: 64, pos: 'right-0 top-32 rotate-2 [animation-delay:-3.5s]' },
];

function DealCard({ icon: Icon, name, price, was, off, sold, pos }) {
  return (
    <div className={cn('absolute w-64 animate-float rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10', pos)}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-ink">{price}</span> <s className="ml-1">{was}</s>
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="rounded-md bg-brand px-1.5 py-0.5 font-bold text-white">{off}</span>
        <span className="text-slate-600">{sold}% claimed</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-linear-to-r from-brand to-orange-400" style={{ width: `${sold}%` }} />
      </div>
    </div>
  );
}

export function HeroPanel({ className }) {
  const [slide, setSlide] = useState(0);
  const { h, m, s } = useCountdown(2 * 3600 + 14 * 60 + 36);

  useEffect(() => {
    const id = setInterval(() => setSlide((i) => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  const current = SLIDES[slide];

  return (
    <aside className={cn('relative flex-col justify-between overflow-hidden border-l border-slate-200 bg-slate-50 p-12', className)}>
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 size-[540px] rounded-full bg-brand/20 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-36 -left-28 size-[440px] rounded-full bg-accent/15 blur-[130px]" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0" />

      {/* Decorative live-sale strip. Hidden from screen readers: it is a teaser, not content. */}
      <div aria-hidden className="relative flex items-center justify-between">
        <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
          <span className="size-2 animate-glow rounded-full bg-brand" />
          Live flash sale
        </span>
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-xs text-slate-600">Ends in</span>
          {[h, m, s].map((v, i) => (
            <Fragment key={i}>
              <span className="grid h-9 min-w-9 place-items-center rounded-lg bg-brand px-2 text-sm font-bold tabular-nums text-white">{v}</span>
              {i < 2 && <span className="text-slate-400">:</span>}
            </Fragment>
          ))}
        </div>
      </div>

      <div aria-hidden className="relative mx-auto my-10 h-72 w-full max-w-md">
        {DEALS.map((d) => <DealCard key={d.name} {...d} />)}
      </div>

      <div className="relative">
        <div key={slide} className="animate-enter">
          <h2 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-ink">
            {current.lines[0]}
            <br />
            <span className="text-brand">{current.lines[1]}</span>
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-600">{current.text}</p>
        </div>
        <div className="mt-8 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              aria-label={`Show message ${i + 1} of ${SLIDES.length}`}
              aria-current={i === slide || undefined}
              className={cn('h-1.5 rounded-full outline-none transition-all duration-500 focus-visible:ring-4 focus-visible:ring-accent/40', i === slide ? 'w-8 bg-brand' : 'w-3 bg-slate-300 hover:bg-slate-400')}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
