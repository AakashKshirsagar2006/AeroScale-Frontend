import { dayKey, parseDay } from '@/shared/lib/format';

const n = (v) => Number(v ?? 0);

/**
 * Backend SellerAnalyticsResponse -> UI shape.
 * Days with no sales may be missing from `daily`; we fill them with zeros so charts have a point for every day.
 */
export function toAnalytics(raw, days) {
  const end = raw.to ? parseDay(raw.to) : new Date();
  end.setHours(0, 0, 0, 0);
  const byKey = new Map((raw.daily ?? []).map((d) => [d.date, d]));

  const daily = Array.from({ length: days }, (_, i) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (days - 1 - i));
    const row = byKey.get(dayKey(date));
    return { date, revenue: n(row?.revenue), orders: n(row?.orders), units: n(row?.unitsSold) };
  });

  const s = raw.summary ?? {};
  const revenue = n(s.revenue ?? daily.reduce((t, d) => t + d.revenue, 0));
  const orders = n(s.orders ?? daily.reduce((t, d) => t + d.orders, 0));
  const units = n(s.unitsSold ?? daily.reduce((t, d) => t + d.units, 0));

  return {
    days,
    daily,
    summary: {
      revenue, orders, units,
      aov: orders ? revenue / orders : 0,
      prev: { revenue: n(s.previousRevenue), orders: n(s.previousOrders), units: n(s.previousUnitsSold) },
    },
    statuses: (raw.statusBreakdown ?? []).map((x) => ({ status: x.status, count: n(x.count) })),
    source: { flash: n(raw.revenueBySource?.flashSale), regular: n(raw.revenueBySource?.regular) },
    topProducts: (raw.topProducts ?? []).map((p) => ({ id: p.productId, name: p.name, imageUrl: p.imageUrl ?? null, units: n(p.unitsSold), revenue: n(p.revenue) })),
  };
}
