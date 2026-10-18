import { useState } from 'react';
import { CircleCheck, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Button } from '@/shared/ui/Button';
import { Logo } from '@/shared/ui/Logo';

/** Placeholder landing page per role, so sign-in has somewhere to go. Dark top bar, light content, like the board. */
function DashboardStub({ title, text, sellerNote = false }) {
  const { user, welcome, dismissWelcome, logout } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const signOut = async () => {
    setLeaving(true);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Logo />
          <Button variant="secondary" size="sm" onClick={signOut} loading={leaving}>
            <LogOut className="size-4" aria-hidden />
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {welcome && (
          <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-emerald-900">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
            <p className="flex-1 leading-relaxed">
              Your account is ready.
              {sellerNote && ' We are verifying your business details, so selling opens once that is done.'}
            </p>
            <button type="button" onClick={dismissWelcome} aria-label="Dismiss" className="rounded-md p-1 text-emerald-800 outline-none hover:text-ink focus-visible:ring-4 focus-visible:ring-accent/40">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1 text-slate-600">{text}</p>

          <dl className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 text-sm">
            <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-slate-600">Signed in as</dt><dd className="truncate font-medium text-ink">{user.email}</dd></div>
            <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-slate-600">Role</dt><dd className="font-medium text-ink">{user.role}</dd></div>
          </dl>
        </div>
      </main>
    </div>
  );
}

export const AdminHome = () => <DashboardStub title="Admin console" text="Platform controls will live here." />;
