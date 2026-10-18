import { CircleCheck, IndianRupee, ReceiptText, Star, Wallet, X } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { analyticsApi } from '@/features/seller-analytics';
import { sellerOrderApi } from '@/features/seller-orders';
import { sellerProductApi } from '@/features/seller-products';
import { useSellerProfile } from '@/features/seller';
import { AreaChart, Sparkline } from '@/shared/charts';
import { formatPrice, percentChange } from '@/shared/lib/format';
import { useAsync } from '@/shared/lib/useAsync';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { Alert } from '@/shared/ui/Alert';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StatCard } from '@/shared/ui/StatCard';
import { AttentionList } from '../components/AttentionList';
import { RecentOrders } from '../components/RecentOrders';
import { SellerHero } from '../components/SellerHero';

const money = (n) => formatPrice(Math.round(n));

export default function DashboardPage() {
  const { welcome, dismissWelcome } = useAuth();
  const { profile, status, load } = useSellerProfile();

  // Each block loads on its own, so one slow or missing endpoint never blanks the page.
  const recent = useAsync(() => sellerOrderApi.list({ size: 5 }), []);
  const toShip = useAsync(() => sellerOrderApi.list({ size: 1, status: 'CONFIRMED' }), []);
  const drafts = useAsync(() => sellerProductApi.list({ size: 1, status: 'DRAFT' }), []);
  const week = useAsync(() => analyticsApi.get(7), []);

  if (status === 'error' && !profile) return <ErrorState error={null} onRetry={load} title="Could not load your dashboard" />;
  const loading = !profile;
  const aov = profile && profile.totalOrders ? profile.totalRevenue / profile.totalOrders : 0;
  const weekRevenue = week.data?.daily.map((d) => d.revenue) ?? [];

  return (
    <div className="space-y-6">
      {welcome && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-emerald-900">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
          <p className="flex-1 leading-relaxed">Your seller account is ready. Add your first product to start selling. We are verifying your business details in the background.</p>
          <button type="button" onClick={dismissWelcome} aria-label="Dismiss" className="rounded-md p-1 text-emerald-800 outline-none hover:text-ink focus-visible:ring-4 focus-visible:ring-accent/40"><X className="size-4" aria-hidden /></button>
        </div>
      )}
      {profile && (profile.verification === 'REJECTED' || profile.verification === 'SUSPENDED') && (
        <Alert variant="warning">Your account is {profile.verification.toLowerCase()}. Update your business details or contact support to get back to selling.</Alert>
      )}

      <SellerHero profile={profile} loading={loading} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" Icon={IndianRupee} tone="brand" loading={loading} value={<AnimatedNumber value={profile?.totalRevenue ?? 0} format={money} />}>
          {weekRevenue.length > 1 && <div className="mt-3"><Sparkline values={weekRevenue} /></div>}
        </StatCard>
        <StatCard label="Total orders" Icon={ReceiptText} tone="accent" loading={loading} value={<AnimatedNumber value={profile?.totalOrders ?? 0} />}
          change={week.data ? percentChange(week.data.summary.orders, week.data.summary.prev.orders) : null} hint={week.data ? 'vs previous 7 days' : undefined} />
        <StatCard label="Average order value" Icon={Wallet} tone="success" loading={loading} value={<AnimatedNumber value={aov} format={money} />} hint="Revenue per order" />
        <StatCard label="Store rating" Icon={Star} tone="amber" loading={loading} value={profile?.rating ? profile.rating.toFixed(1) : 'New'} hint={profile?.rating ? 'Out of 5' : 'Ratings appear after your first reviews'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-2"><h2 className="text-base font-bold text-ink">Revenue, last 7 days</h2><p className="text-sm text-slate-600">Hover or touch the line for each day.</p></div>
          {week.status === 'loading' && <Skeleton className="h-56" />}
          {week.status === 'error' && <p className="py-12 text-center text-sm text-slate-600">The chart is not available right now.</p>}
          {week.status === 'ready' && <AreaChart label="Revenue, last 7 days" height={230} data={week.data.daily.map((d) => ({ date: d.date, value: d.revenue, note: `${d.orders} orders` }))} />}
        </section>
        <AttentionList toShip={toShip.data?.total ?? 0} drafts={drafts.data?.total ?? 0} verification={profile?.verification} />
      </div>

      <RecentOrders orders={recent.data?.items ?? []} loading={recent.status === 'loading'} />
    </div>
  );
}
