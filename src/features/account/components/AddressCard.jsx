import { Briefcase, Home, MapPin, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const ICONS = { HOME: Home, WORK: Briefcase, OTHER: MapPin };

/**
 * mode="select": a radio-style card for checkout (pass `selected` and `onSelect`).
 * mode="manage": shows edit / delete buttons (pass `onEdit`, `onDelete`).
 */
export function AddressCard({ address, mode = 'manage', selected = false, onSelect, onEdit, onDelete }) {
  const Icon = ICONS[address.label] ?? MapPin;
  const body = (
    <>
      <div className="flex items-start gap-3">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', selected ? 'bg-brand text-white' : 'bg-brand/10 text-brand')}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
            {address.recipientName}
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold capitalize text-slate-700">{address.label.toLowerCase()}</span>
            {address.isDefault && <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">Default</span>}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            {address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}<br />
            {address.city}, {address.state} {address.pincode}, {address.country}
          </p>
          <p className="mt-1 text-sm text-slate-600">{address.phoneNo}</p>
        </div>
      </div>
      {mode === 'manage' && (
        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-accent/30"><Pencil className="size-4" aria-hidden />Edit</button>
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-700 outline-none hover:bg-brand/10 focus-visible:ring-4 focus-visible:ring-brand/30"><Trash2 className="size-4" aria-hidden />Delete</button>
        </div>
      )}
    </>
  );

  if (mode === 'select') {
    return (
      <label className="relative block cursor-pointer">
        <input type="radio" name="shipping-address" checked={selected} onChange={onSelect} className="peer sr-only" />
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 transition hover:border-slate-300 peer-checked:border-brand peer-checked:bg-brand/5 peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30">{body}</div>
      </label>
    );
  }
  return <div className="rounded-2xl border border-slate-200 bg-white p-4">{body}</div>;
}
