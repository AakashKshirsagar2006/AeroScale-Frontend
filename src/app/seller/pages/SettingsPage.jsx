import { CalendarDays, Star, Zap } from 'lucide-react';
import { SellerProfileForm, useSellerProfile, VerificationBadge } from '@/features/seller';
import { formatDate } from '@/shared/lib/format';
import { ErrorState } from '@/shared/ui/ErrorState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';

function Fact({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand"><Icon className="size-5" aria-hidden /></span>
      <div><p className="text-xs text-slate-600">{label}</p><p className="text-base font-extrabold text-ink">{value}</p></div>
    </div>
  );
}

export default function SettingsPage() {
  const { profile, status, save, load } = useSellerProfile();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Business settings" subtitle="How your store appears and where orders ship from." />
      {!profile && status === 'error' && <ErrorState onRetry={load} title="Could not load your profile" />}
      {!profile && status !== 'error' && <Skeleton className="h-96 rounded-2xl" />}
      {profile && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Fact Icon={Star} label="Rating" value={profile.rating ? profile.rating.toFixed(1) : 'New'} />
            <Fact Icon={Zap} label="Flash sale slots" value={profile.flashSaleSlots} />
            <Fact Icon={CalendarDays} label="Selling since" value={profile.joinedAt ? formatDate(profile.joinedAt).split(',')[0] : '-'} />
          </div>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-ink">Business details</h2>
              <VerificationBadge status={profile.verification} />
            </div>
            <p className="mb-4 text-sm text-slate-600">Signed in as {profile.email}</p>
            <SellerProfileForm profile={profile} onSave={save} />
          </section>
        </div>
      )}
    </div>
  );
}
