import { Coins, MapPinPlus, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addressActions, AddressCard, AddressForm, ProfileForm, useAddresses, useProfile } from '@/features/account';
import { parseApiError } from '@/shared/http/errors';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Modal } from '@/shared/ui/Modal';
import { Skeleton } from '@/shared/ui/Skeleton';
import { toast } from '@/shared/ui/toast';
import { MapPin } from 'lucide-react';

const TABS = [['profile', 'Profile'], ['addresses', 'Addresses']];

function Stat({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand"><Icon className="size-5" aria-hidden /></span>
      <div><p className="text-xs text-slate-600">{label}</p><p className="text-lg font-extrabold text-ink">{value}</p></div>
    </div>
  );
}

function ProfileTab() {
  const { profile, status, save } = useProfile();
  if (!profile) return status === 'error'
    ? <p className="text-sm text-slate-700">We could not load your profile. Refresh to try again.</p>
    : <Skeleton className="h-72 rounded-2xl" />;
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat Icon={Wallet} label="Wallet balance" value={formatPrice(profile.walletBalance)} />
        <Stat Icon={Coins} label="Loyalty points" value={profile.loyaltyPoint} />
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-base font-bold text-ink">Personal details</h2>
        <p className="mb-4 text-sm text-slate-600">Signed in as {profile.email}</p>
        <ProfileForm profile={profile} onSave={save} />
      </section>
    </div>
  );
}

function AddressesTab() {
  const addresses = useAddresses();
  const [editing, setEditing] = useState(null); // null | 'new' | address
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { addressActions.load().catch(() => {}); }, []);

  const save = async (values) => {
    if (editing === 'new') await addresses.add(values); else await addresses.update(editing.id, values);
    setEditing(null);
    toast.success('Address saved');
  };
  const remove = async () => {
    try { await addresses.remove(deleting.id); toast.success('Address deleted'); }
    catch (e) { toast.error(parseApiError(e).message); }
    setDeleting(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Saved addresses</h2>
        <Button size="sm" onClick={() => setEditing('new')}><MapPinPlus className="size-4" aria-hidden />Add address</Button>
      </div>
      {addresses.status === 'loading' && <div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-40 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div>}
      {addresses.status === 'ready' && !addresses.items.length && <EmptyState icon={MapPin} title="No saved addresses" text="Add one now and checkout becomes a single tap." />}
      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.items.map((a) => <AddressCard key={a.id} address={a} onEdit={() => setEditing(a)} onDelete={() => setDeleting(a)} />)}
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add a delivery address' : 'Edit address'}>
        <AddressForm initial={editing && editing !== 'new' ? editing : undefined} onSubmit={save} onCancel={() => setEditing(null)} />
      </Modal>
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete this address?">
        <p className="text-sm text-slate-700">Past orders keep the address they were sent to.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Keep it</Button>
          <Button onClick={remove}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function AccountPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'addresses' ? 'addresses' : 'profile';
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-ink">My account</h1>
      <div role="tablist" aria-label="Account sections" className="mb-6 inline-flex rounded-xl bg-slate-200/70 p-1">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" type="button" aria-selected={tab === key} onClick={() => setParams(key === 'profile' ? {} : { tab: key })}
            className={cn('rounded-lg px-5 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-accent/30', tab === key ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink')}>{label}</button>
        ))}
      </div>
      {tab === 'profile' ? <ProfileTab /> : <AddressesTab />}
    </div>
  );
}
