import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CalendarDays, MapPin, Truck } from 'lucide-react';
import { parseApiError } from '@/shared/http/errors';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { sellerProfileSchema } from '../model/schemas';

const today = () => new Date().toISOString().slice(0, 10);

/** Edits business name, date of birth, address and warehouse pincode. `onSave(values)` returns a promise. */
export function SellerProfileForm({ profile, onSave }) {
  const [failure, setFailure] = useState(null);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: {
      businessName: profile.businessName,
      dob: profile.dob ? String(profile.dob).slice(0, 10) : '',
      address: profile.address,
      pincode: profile.pincode,
    },
  });

  const submit = handleSubmit(async (values) => {
    setFailure(null); setSaved(false);
    try { await onSave(values); reset(values); setSaved(true); }
    catch (err) {
      const parsed = parseApiError(err);
      setFailure(parsed);
      const map = { bussinessName: 'businessName', dob: 'dob', bussinessAddress: 'address', wareHousePincode: 'pincode' };
      Object.entries(parsed.fieldErrors).forEach(([k, m]) => map[k] && setError(map[k], { message: m }));
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {failure && <Alert key={Date.now()} variant="error">{failure.message}</Alert>}
      {saved && !isDirty && <Alert variant="success">Business details updated.</Alert>}
      <Input label="Business name" icon={Building2} error={errors.businessName?.message} {...register('businessName')} />
      <Input label="Date of birth" icon={CalendarDays} type="date" max={today()} error={errors.dob?.message} {...register('dob')} />
      <Input label="Business address" icon={MapPin} placeholder="Shop no, street, city" error={errors.address?.message} {...register('address')} />
      <Input label="Warehouse pincode" icon={Truck} inputMode="numeric" maxLength={6} placeholder="400001" hint="Where orders are shipped from." error={errors.pincode?.message} {...register('pincode')} />
      <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save changes</Button>
    </form>
  );
}
