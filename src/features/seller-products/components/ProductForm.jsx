import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Boxes, IndianRupee, Tag } from 'lucide-react';
import { parseApiError } from '@/shared/http/errors';
import { cn } from '@/shared/lib/cn';
import { useObjectUrl } from '@/shared/lib/useObjectUrl';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { createProductSchema, editProductSchema, STATUSES } from '../model/schemas';
import { ImagePicker } from './ImagePicker';
import { ProductPreview } from './ProductPreview';

/**
 * Create AND edit. `initial` present = edit mode.
 * `onSubmit({ values, image })` returns a promise; errors thrown from it are shown on the matching fields.
 */
export function ProductForm({ initial, onSubmit, onCancel }) {
  const editing = Boolean(initial);
  const [image, setImage] = useState(null);
  const [failure, setFailure] = useState(null);
  const fileUrl = useObjectUrl(image);

  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(editing ? editProductSchema : createProductSchema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? '',
      status: initial?.status ?? 'ACTIVE',
      ...(editing ? {} : { initialStock: 0 }),
    },
  });
  const live = watch();

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try { await onSubmit({ values, image }); }
    catch (err) {
      const parsed = parseApiError(err);
      setFailure(parsed);
      Object.entries(parsed.fieldErrors).forEach(([k, m]) => setError(k, { message: m }));
    }
  });

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={submit} noValidate className="space-y-6">
        {failure && <Alert key={Date.now()} variant="error">{failure.message}</Alert>}

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-bold text-ink">Basics</h2>
          <Input label="Product name" icon={Tag} placeholder="e.g. Sony WH-1000XM5 Headphones" error={errors.name?.message} {...register('name')} />
          <Textarea label="Description" placeholder="What makes it worth buying? Features, what is in the box, warranty..." counter={{ value: live.description?.length ?? 0, max: 5000 }} error={errors.description?.message} {...register('description')} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <ImagePicker previewUrl={fileUrl ?? initial?.imageUrl ?? null} hasSaved={editing && Boolean(initial.imageUrl)} onPick={setImage} />
        </section>

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-bold text-ink">Pricing{editing ? '' : ' and stock'}</h2>
          <div className={cn('grid gap-4', !editing && 'sm:grid-cols-2')}>
            <Input label="Price (₹)" icon={IndianRupee} type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00" error={errors.price?.message} {...register('price')} />
            {!editing && <Input label="Units in stock" icon={Boxes} type="number" step="1" min="0" inputMode="numeric" hint="You can add more any time." error={errors.initialStock?.message} {...register('initialStock')} />}
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-800">Visibility</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {STATUSES.filter((s) => editing || s.value !== 'ARCHIVED').map((s) => (
                <label key={s.value} className="cursor-pointer rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-300 has-checked:border-brand has-checked:bg-brand/5 has-checked:ring-4 has-checked:ring-brand/10 has-focus-visible:ring-4 has-focus-visible:ring-accent/30">
                  <input type="radio" value={s.value} className="sr-only" {...register('status')} />
                  <span className="block text-sm font-bold text-ink">{s.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-600">{s.text}</span>
                </label>
              ))}
            </div>
            {errors.status && <p role="alert" className="mt-1.5 text-xs font-medium text-brand-700">{errors.status.message}</p>}
          </fieldset>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" loading={isSubmitting} disabled={editing && !isDirty && !image}>{editing ? 'Save changes' : live.status === 'ACTIVE' ? 'Publish product' : 'Save product'}</Button>
        </div>
      </form>

      <aside className="lg:sticky lg:top-24">
        <ProductPreview name={live.name} price={live.price} description={live.description} status={live.status} imageUrl={fileUrl ?? initial?.imageUrl ?? null} />
      </aside>
    </div>
  );
}
