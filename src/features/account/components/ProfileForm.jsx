import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, User } from 'lucide-react';
import { parseApiError } from '@/shared/http/errors';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { profileSchema } from '../model/schemas';

const today = () => new Date().toISOString().slice(0, 10);

export function ProfileForm({ profile, onSave }) {
  const [failure, setFailure] = useState(null);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.fullName ?? '', dob: profile.dob ? String(profile.dob).slice(0, 10) : '' },
  });

  const submit = handleSubmit(async (values) => {
    setFailure(null); setSaved(false);
    try { await onSave(values); reset(values); setSaved(true); } catch (err) { setFailure(parseApiError(err)); }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {failure && <Alert variant="error">{failure.message}</Alert>}
      {saved && !isDirty && <Alert variant="success">Profile updated.</Alert>}
      <Input label="Full name" icon={User} autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
      <Input label="Date of birth" icon={CalendarDays} type="date" max={today()} autoComplete="bday" error={errors.dob?.message} {...register('dob')} />
      <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save profile</Button>
    </form>
  );
}
