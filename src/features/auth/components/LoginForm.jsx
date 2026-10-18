import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { features } from '@/shared/config/features';
import { parseApiError } from '@/shared/http/errors';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { SoonBadge } from '@/shared/ui/SoonBadge';
import { useAuth } from '../model/useAuth';
import { loginSchema } from '../model/schemas';
import { SocialButtons } from './SocialButtons';

export function LoginForm({ notice }) {
  const { login } = useAuth();
  const [failure, setFailure] = useState(null);
  const [attempt, setAttempt] = useState(0); // changing key replays the shake on repeated failures

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await login(values); // on success the route guard moves the user on
    } catch (err) {
      setFailure(parseApiError(err));
      setAttempt((n) => n + 1);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
      {notice && !failure && <Alert variant="info">{notice}</Alert>}
      {failure && (
        <Alert key={attempt} variant={failure.status === 423 ? 'warning' : 'error'}>
          {failure.message}
        </Alert>
      )}

      <Input label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <PasswordInput label="Password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />

      <div className="flex justify-end">
        {features.forgotPassword ? (
          <Link to="/forgot-password" className="text-sm font-semibold text-brand-700 hover:underline">Forgot password?</Link>
        ) : (
          <span className="text-sm text-slate-500" title="Password reset is coming soon">Forgot password?<SoonBadge /></span>
        )}
      </div>

      <Button type="submit" fullWidth loading={isSubmitting}>Login</Button>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-slate-300" />
        or continue with
        <span className="h-px flex-1 bg-slate-300" />
      </div>
      <SocialButtons />
    </form>
  );
}
