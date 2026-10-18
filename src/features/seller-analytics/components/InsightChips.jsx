import { CalendarCheck, Flame, Sparkles, Trophy } from 'lucide-react';
import { formatPrice, formatWeekday } from '@/shared/lib/format';

function Chip({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Icon className="size-5" aria-hidden /></span>
      <div className="min-w-0"><p className="text-xs text-slate-600">{label}</p><p className="truncate text-sm font-bold text-ink">{value}</p></div>
    </div>
  );
}

export function InsightChips({ insights }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Chip Icon={Trophy} label="Best day" value={insights.best ? `${formatWeekday(insights.best.date)} · ${formatPrice(insights.best.revenue)}` : 'No sales yet'} />
      <Chip Icon={Sparkles} label="Average per day" value={formatPrice(Math.round(insights.perDay))} />
      <Chip Icon={CalendarCheck} label="Days with orders" value={insights.activeDays} />
      <Chip Icon={Flame} label="Revenue from flash sales" value={`${insights.flashShare}%`} />
    </div>
  );
}
