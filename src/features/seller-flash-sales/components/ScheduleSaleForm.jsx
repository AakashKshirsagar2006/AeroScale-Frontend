import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, IndianRupee, Layers, Users } from 'lucide-react';
import { parseApiError } from '@/shared/http/errors';
import { formatPrice, toLocalInput } from '@/shared/lib/format';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { saleSchema } from '../model/schemas';

const HOUR = 3600_000;

/** `products` = the seller's ACTIVE products. `onSubmit(values)` returns a promise. */
export function ScheduleSaleForm({ products, initialProductId = '', slots = 5, onSubmit, onCancel }) {
  const [failure, setFailure] = useState(null);
  const schema = useMemo(() => saleSchema(products), [products]);
  const startAt = Math.ceil((Date.now() + HOUR) / HOUR) * HOUR; // next full hour, at least an hour away

  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { productId: initialProductId, salePrice: '', totalQuantity: '', maxItemsPerUser: 2, startTime: toLocalInput(startAt), endTime: toLocalInput(startAt + 24 * HOUR) },
  });

  const picked = products.find((p) => p.id === watch('productId'));
  const off = picked && Number(watch('salePrice')) > 0 && Number(watch('salePrice')) < picked.price
    ? Math.round((1 - Number(watch('salePrice')) / picked.price) * 100) : null;

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try { await onSubmit(values); }
    catch (err) {
      const parsed = parseApiError(err);
      setFailure(parsed);
      Object.entries(parsed.fieldErrors).forEach(([k, m]) => setError(k, { message: m }));
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {failure && <Alert key={Date.now()} variant="error">{failure.message}</Alert>}
      <Select label="Product" error={errors.productId?.message} {...register('productId')}>
        <option value="">Choose a product...</option>
        {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>)}
      </Select>
      {!products.length && <Alert variant="info">You need an active product before you can run a sale.</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Sale price (₹)" icon={IndianRupee} type="number" step="0.01" min="0" inputMode="decimal" error={errors.salePrice?.message} hint={off != null ? `${off}% off the regular price` : picked ? `Regular price ${formatPrice(picked.price)}` : undefined} {...register('salePrice')} />
        <Input label="Units for the sale" icon={Layers} type="number" min="1" inputMode="numeric" error={errors.totalQuantity?.message} hint={picked?.availableStock != null ? `${picked.availableStock} in stock` : undefined} {...register('totalQuantity')} />
      </div>
      <Input label="Max per customer" icon={Users} type="number" min="1" inputMode="numeric" error={errors.maxItemsPerUser?.message} {...register('maxItemsPerUser')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Starts" icon={CalendarClock} type="datetime-local" error={errors.startTime?.message} {...register('startTime')} />
        <Input label="Ends" icon={CalendarClock} type="datetime-local" error={errors.endTime?.message} {...register('endTime')} />
      </div>
      <p className="text-xs text-slate-600">You can run up to {slots} sales at the same time. Times use your device's time zone.</p>
      <div className="flex justify-end gap-3 pt-1">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" loading={isSubmitting} disabled={!products.length}>Schedule sale</Button>
      </div>
    </form>
  );
}
