import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseApiError } from '@/shared/http/errors';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { addressSchema } from '../model/schemas';

const LABELS = [['HOME', 'Home'], ['WORK', 'Work'], ['OTHER', 'Other']];
const EMPTY = { label: 'HOME', recipientName: '', phoneNo: '', addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', pincode: '', isDefault: false };

/** Add or edit. Pass `initial` to edit. onSubmit(values) may throw; its message is shown inside the form. */
export function AddressForm({ initial, onSubmit, onCancel }) {
  const [failure, setFailure] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: initial ?? EMPTY,
  });

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try { await onSubmit(values); } catch (err) { setFailure(parseApiError(err)); }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {failure && <Alert variant="error">{failure.message}</Alert>}

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-800">Address type</legend>
        <div className="flex gap-2">
          {LABELS.map(([value, text]) => (
            <label key={value} className="relative cursor-pointer">
              <input type="radio" value={value} className="peer sr-only" {...register('label')} />
              <span className="block rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition peer-checked:border-brand peer-checked:bg-brand/10 peer-checked:text-brand-700 peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30">{text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Recipient name" autoComplete="name" error={errors.recipientName?.message} {...register('recipientName')} />
        <Input label="Phone number" type="tel" autoComplete="tel" placeholder="+919876543210" error={errors.phoneNo?.message} {...register('phoneNo')} />
      </div>
      <Input label="Address line 1" autoComplete="address-line1" placeholder="House no, street" error={errors.addressLine1?.message} {...register('addressLine1')} />
      <Input label="Address line 2 (optional)" autoComplete="address-line2" placeholder="Landmark, area" error={errors.addressLine2?.message} {...register('addressLine2')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="City" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
        <Input label="State" autoComplete="address-level1" error={errors.state?.message} {...register('state')} />
        <Input label="Pincode" inputMode="numeric" maxLength={6} autoComplete="postal-code" error={errors.pincode?.message} {...register('pincode')} />
        <Input label="Country" autoComplete="country-name" error={errors.country?.message} {...register('country')} />
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-800">
        <input type="checkbox" className="size-4 rounded border-slate-300 accent-brand" {...register('isDefault')} />
        Make this my default address
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{initial ? 'Save changes' : 'Save address'}</Button>
      </div>
    </form>
  );
}
