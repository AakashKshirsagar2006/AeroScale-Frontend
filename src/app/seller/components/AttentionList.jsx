import { ChevronRight, ClipboardList, FilePen, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { plural } from '@/shared/lib/format';

function Row({ to, Icon, tone, title, text }) {
  return (
    <Link to={to} className="group flex items-center gap-3 rounded-xl p-3 outline-none transition hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-accent/30">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tone)}><Icon className="size-5" aria-hidden /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">{title}</p><p className="text-xs text-slate-600">{text}</p></div>
      <ChevronRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

/** "Do this next" list. Shows a friendly all-clear when there is nothing to do. */
export function AttentionList({ toShip, drafts, verification }) {
  const rows = [];
  if (toShip > 0) rows.push(<Row key="ship" to="/seller/orders?tab=CONFIRMED" Icon={ClipboardList} tone="bg-brand/10 text-brand" title={`${plural(toShip, 'order')} to ship`} text="Paid and waiting for you" />);
  if (drafts > 0) rows.push(<Row key="draft" to="/seller/products?status=DRAFT" Icon={FilePen} tone="bg-amber-100 text-amber-700" title={`${plural(drafts, 'draft product')}`} text="Publish them so buyers can see them" />);
  if (verification && verification !== 'VERIFIED') rows.push(<Row key="verify" to="/seller/settings" Icon={ShieldAlert} tone="bg-accent/10 text-accent" title="Complete your business details" text="A full profile speeds up verification" />);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="mb-2 text-base font-bold text-ink">Needs your attention</h2>
      {rows.length ? <div className="-mx-1 space-y-1">{rows}</div> : <p className="py-6 text-center text-sm text-slate-600">You are all caught up. Nice work.</p>}
    </section>
  );
}
