import { BadgePercent, Clock, ShieldCheck, Zap } from 'lucide-react';

const ITEMS = [
  { Icon: Zap, title: 'Fast checkout', text: 'Pay in a few taps' },
  { Icon: ShieldCheck, title: 'Authentic products', text: 'Verified sellers only' },
  { Icon: BadgePercent, title: 'Great prices', text: 'Deals you will not find elsewhere' },
  { Icon: Clock, title: 'Limited time', text: 'Sales that end on a clock' },
];

export function TrustStrip() {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ITEMS.map(({ Icon, title, text }) => (
        <li key={title} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand sm:size-10"><Icon className="size-5" aria-hidden /></span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-ink">{title}</p>
            <p className="mt-0.5 text-xs leading-snug text-slate-600">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
