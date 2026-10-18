import { percentChange } from '@/shared/lib/format';

/** Everything derived from the numbers lives here, so components stay dumb. */
export function buildInsights({ daily, summary, source }) {
  const best = daily.reduce((b, d) => (d.revenue > b.revenue ? d : b), daily[0] ?? { revenue: 0, date: new Date() });
  const activeDays = daily.filter((d) => d.orders > 0).length;
  const sourceTotal = source.flash + source.regular;
  return {
    best: best.revenue > 0 ? best : null,
    perDay: daily.length ? summary.revenue / daily.length : 0,
    activeDays,
    flashShare: sourceTotal ? Math.round((source.flash / sourceTotal) * 100) : 0,
    change: {
      revenue: percentChange(summary.revenue, summary.prev.revenue),
      orders: percentChange(summary.orders, summary.prev.orders),
      units: percentChange(summary.units, summary.prev.units),
    },
  };
}
