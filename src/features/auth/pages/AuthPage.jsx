import { useLocation } from 'react-router-dom';
import { Logo } from '@/shared/ui/Logo';
import { AuthShell } from '../components/AuthShell';
import { AuthTabs } from '../components/AuthTabs';
import { LoginForm } from '../components/LoginForm';
import { RegisterWizard } from '../components/RegisterWizard';

const COPY = {
  login: { title: 'Welcome back', text: 'Login to continue to your account.' },
  register: { title: 'Create your account', text: 'It takes about a minute.' },
};

export default function AuthPage({ mode }) {
  const location = useLocation();
  const copy = COPY[mode];
  const notice = location.state?.expired ? 'Your session expired. Please log in again.' : null;

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <Logo className="mb-8 hidden lg:flex" />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{copy.title}</h1>
        <p className="mt-1.5 text-slate-600">{copy.text}</p>

        <AuthTabs active={mode} linkState={location.state} />

        <div key={mode} className="animate-enter">
          {mode === 'login' ? <LoginForm notice={notice} /> : <RegisterWizard />}
        </div>
      </div>
    </AuthShell>
  );
}
