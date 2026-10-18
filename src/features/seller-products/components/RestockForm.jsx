import { useState } from 'react';
import { PackagePlus } from 'lucide-react';
import { parseApiError } from '@/shared/http/errors';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { QuantityStepper } from '@/shared/ui/QuantityStepper';
import { restockSchema } from '../model/schemas';

const QUICK = [10, 50, 100];

/** Adds units. `onSubmit(quantity)` returns a promise. */
export function RestockForm({ product, onSubmit, onCancel }) {
  const [qty, setQty] = useState(10);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const parsed = restockSchema.safeParse({ quantity: qty });
    if (!parsed.success) return setFailure({ message: parsed.error.issues[0].message });
    setBusy(true); setFailure(null);
    try { await onSubmit(parsed.data.quantity); } catch (err) { setFailure(parseApiError(err)); setBusy(false); }
  };

  const now = product.totalStock;
  return (
    <form onSubmit={submit} className="space-y-5">
      {failure && <Alert variant="error">{failure.message}</Alert>}
      <p className="text-sm text-slate-700"><strong className="text-ink">{product.name}</strong>{now != null && <> currently has <strong className="text-ink">{now}</strong> units.</>}</p>
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} min={1} max={100000} onChange={setQty} label="Units to add" />
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => setQty((v) => v + q)} className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-ink outline-none transition hover:border-brand hover:text-brand-700 focus-visible:ring-4 focus-visible:ring-accent/30">+{q}</button>
        ))}
      </div>
      {now != null && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">New total: <strong className="text-lg text-ink">{now + qty}</strong> units</p>}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" loading={busy}><PackagePlus className="size-4" aria-hidden />Add stock</Button>
      </div>
    </form>
  );
}
