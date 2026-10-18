import { IndianRupee, Package, ReceiptText, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { analyticsApi, buildInsights, ChartCard, InsightChips, TopProducts } from '@/features/seller-analytics';
import { AreaChart, BarChart, DonutChart } from '@/shared/charts';
import { formatPrice } from '@/shared/lib/format';
import { useAsync } from '@/shared/lib/useAsync';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { ErrorState } from '@/shared/ui/ErrorState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StatCard } from '@/shared/ui/StatCard';
import { Tabs } from '@/shared/ui/Tabs';

const RANGES = [{ value: 7, label: '7 days' }, { value: 30, label: '30 days' }, { value: 90, label: '90 days' }];
const STATUS = { CONFIRMED: ['Ready to ship', '#ef4444'], SHIPPED: ['Shipped', '#8b5cf6'], DELIVERED: ['Delivered', '#10b981'], CANCELLED: ['Cancelled', '#94a3b8'] };
const money = (n) => formatPrice(Math.round(n));

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, status, error, reload } = useAsync(() => analyticsApi.get(days), [days]);
  const insights = useMemo(() => (data ? buildInsights(data) : null), [data]);
  const loading = status === 'loading';

  const revenueSeries = useMemo(() => data?.daily.map((d) => ({ date: d.date, value: d.revenue, note: `${d.orders} ${d.orders === 1 ? 'order' : 'orders'}` })) ?? [], [data]);
  const orderSeries = useMemo(() => data?.daily.map((d) => ({ date: d.date, value: d.orders })) ?? [], [data]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Analytics" title="How your store is performing" subtitle="Revenue, orders and your best sellers, compared with the period before."
        actions={<Tabs tabs={RANGES} value={days} onChange={setDays} label="Date range" />} />

      {status === 'error' && <ErrorState error={error} onRetry={reload} title="Could not load your analytics" />}

      {status !== 'error' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue" Icon={IndianRupee} tone="brand" loading={loading} value={<AnimatedNumber value={data?.summary.revenue ?? 0} format={money} />} change={insights?.change.revenue} hint="vs previous period" />
            <StatCard label="Orders" Icon={ReceiptText} tone="accent" loading={loading} value={<AnimatedNumber value={data?.summary.orders ?? 0} />} change={insights?.change.orders} hint="vs previous period" />
            <StatCard label="Units sold" Icon={Package} tone="success" loading={loading} value={<AnimatedNumber value={data?.summary.units ?? 0} />} change={insights?.change.units} hint="vs previous period" />
            <StatCard label="Average order" Icon={Wallet} tone="amber" loading={loading} value={<AnimatedNumber value={data?.summary.aov ?? 0} format={money} />} hint="Revenue per order" />
          </div>

          <ChartCard title="Revenue over time" subtitle={`Last ${days} days`}>
            {loading ? <Skeleton className="h-72" /> : <AreaChart label="Revenue" data={revenueSeries} height={300} />}
          </ChartCard>

          {insights && <InsightChips insights={insights} />}

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Orders per day" subtitle="How busy each day was">
              {loading ? <Skeleton className="h-60" /> : <BarChart label="Orders per day" data={orderSeries} formatValue={(v) => `${v} ${v === 1 ? 'order' : 'orders'}`} />}
            </ChartCard>
            <ChartCard title="Where revenue comes from" subtitle="Flash sales vs regular prices">
              {loading ? <Skeleton className="h-60" /> : (
                <DonutChart label="Revenue by source" formatValue={(v) => formatPrice(Math.round(v))}
                  slices={[{ label: 'Flash sales', value: data.source.flash, color: '#ef4444' }, { label: 'Regular', value: data.source.regular, color: '#3b82f6' }]}
                  center={<div><p className="text-xs text-slate-600">Flash share</p><p className="text-2xl font-extrabold text-ink">{insights.flashShare}%</p></div>} />
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <ChartCard title="Top products" subtitle="Ranked by revenue in this period">
              {loading ? <Skeleton className="h-64" /> : <TopProducts products={data.topProducts} />}
            </ChartCard>
            <ChartCard title="Order status" subtitle="Orders received in this period">
              {loading ? <Skeleton className="h-60" /> : (
                <DonutChart label="Orders by status" size={156} stroke={20}
                  slices={data.statuses.filter((s) => STATUS[s.status]).map((s) => ({ label: STATUS[s.status][0], value: s.count, color: STATUS[s.status][1] }))}
                  center={<div><p className="text-xs text-slate-600">Orders</p><p className="text-2xl font-extrabold text-ink">{data.statuses.reduce((n, s) => n + s.count, 0)}</p></div>} />
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
