import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CalendarDays, Mail, MapPin, Phone, Store, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { parseApiError } from '@/shared/http/errors';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { useAuth } from '../model/useAuth';
import { registerSchema } from '../model/schemas';
import { PasswordChecklist } from './PasswordChecklist';
import { RoleCards } from './RoleCards';
import { StepProgress } from './StepProgress';

// Which form fields each step owns. Validation runs per step before "Continue".
const STEP_FIELDS = {
  role: ['role'],
  details: ['fullName', 'email', 'phoneNo', 'dob', 'password', 'confirmPassword'],
  business: ['bussinessAdress', 'wareHousePinCode'],
};
const STEP_COPY = {
  role: { label: 'Account', title: 'How will you use AeroScale?', text: 'Pick the account type that fits you.' },
  details: { label: 'Details', title: 'Your details', text: 'This is what you will log in with.' },
  business: { label: 'Business', title: 'Where do you ship from?', text: 'Buyers see this on your seller profile.' },
};
const DEFAULTS = {
  role: 'BUYER', fullName: '', email: '', phoneNo: '', dob: '', password: '', confirmPassword: '',
  bussinessAdress: '', wareHousePinCode: '',
};
const today = () => new Date().toISOString().slice(0, 10);

export function RegisterWizard() {
  const { register: signUp } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [failure, setFailure] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const { register, handleSubmit, trigger, watch, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: DEFAULTS,
  });

  const role = watch('role');
  const password = watch('password');
  const isSeller = role === 'SELLER';
  const steps = isSeller ? ['role', 'details', 'business'] : ['role', 'details'];
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const next = async () => {
    if (await trigger(STEP_FIELDS[step])) {
      setFailure(null);
      setStepIndex((i) => i + 1);
    }
  };
  const back = () => {
    setFailure(null);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await signUp(values); // on success the route guard moves the user to their home
    } catch (err) {
      const parsed = parseApiError(err);
      Object.entries(parsed.fieldErrors).forEach(([name, message]) => setError(name, { type: 'server', message }));
      if (parsed.status === 409) {
        // Duplicate email/phone live on the details step, so bring the user back to it.
        setError(/phone/i.test(parsed.message) ? 'phoneNo' : 'email', { type: 'server', message: parsed.message });
        setStepIndex(steps.indexOf('details'));
      }
      setFailure(parsed);
      setAttempt((n) => n + 1);
    }
  });

  // Enter key: advance on early steps, submit on the last one.
  const onSubmit = (e) => {
    e.preventDefault();
    return isLast ? submit(e) : next();
  };

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6">
      <StepProgress steps={steps.map((s) => STEP_COPY[s].label)} current={stepIndex} />

      <h2 className="mt-6 text-lg font-bold text-ink">{STEP_COPY[step].title}</h2>
      <p className="mt-0.5 text-sm text-slate-600">{STEP_COPY[step].text}</p>

      {failure && <Alert key={attempt} variant="error" className="mt-4">{failure.message}</Alert>}

      <div key={step} className="mt-5 animate-enter space-y-4">
        {step === 'role' && <RoleCards register={register} />}

        {step === 'details' && (
          <>
            <Input
              label={isSeller ? 'Business name' : 'Full name'}
              icon={isSeller ? Store : User}
              autoComplete={isSeller ? 'organization' : 'name'}
              placeholder={isSeller ? 'Sharma Electronics' : 'Rahul Sharma'}
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Phone number" icon={Phone} type="tel" autoComplete="tel" placeholder="+919876543210" error={errors.phoneNo?.message} {...register('phoneNo')} />
              <Input label="Date of birth" icon={CalendarDays} type="date" max={today()} autoComplete="bday" error={errors.dob?.message} {...register('dob')} />
            </div>
            <PasswordInput label="Password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
            <PasswordChecklist value={password} />
            <PasswordInput label="Confirm password" autoComplete="new-password" placeholder="Re-enter your password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          </>
        )}

        {step === 'business' && (
          <>
            <Input label="Business address" icon={MapPin} autoComplete="street-address" placeholder="Shop 12, MG Road, Mumbai" error={errors.bussinessAdress?.message} {...register('bussinessAdress')} />
            <Input label="Warehouse pincode" icon={MapPin} inputMode="numeric" maxLength={6} autoComplete="postal-code" placeholder="400001" error={errors.wareHousePinCode?.message} {...register('wareHousePinCode')} />
          </>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {stepIndex > 0 && (
          <Button variant="secondary" onClick={back} className="px-4">
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
        )}
        <Button type="submit" fullWidth loading={isSubmitting}>
          {isLast ? 'Create account' : 'Continue'}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">Login</Link>
      </p>
    </form>
  );
}
