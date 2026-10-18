import { LogOut, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useSellerProfile, VerificationBadge } from '@/features/seller';

const item = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 outline-none hover:bg-slate-100 focus-visible:bg-slate-100';

export function SellerAccountMenu() {
  const { user, logout } = useAuth();
  const { profile } = useSellerProfile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const root = useRef(null);

  const name = profile?.businessName || user.email.split('@')[0];
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => !root.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  const signOut = async () => { setOpen(false); await logout(); navigate('/login', { replace: true }); };

  return (
    <div ref={root} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu"
        className="grid size-10 place-items-center rounded-full bg-ink text-xs font-bold text-white outline-none ring-offset-2 transition hover:bg-brand focus-visible:ring-4 focus-visible:ring-accent/40">{initials}</button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-72 animate-enter rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15">
          <div className="space-y-1.5 border-b border-slate-100 px-3 pb-3 pt-2">
            <p className="truncate text-sm font-bold text-ink">{name}</p>
            <p className="truncate text-xs text-slate-600">{user.email}</p>
            {profile && <VerificationBadge status={profile.verification} />}
          </div>
          <div className="pt-2">
            <Link role="menuitem" to="/seller/settings" onClick={() => setOpen(false)} className={item}><Settings className="size-4" aria-hidden />Business settings</Link>
            <button role="menuitem" type="button" onClick={signOut} className={`${item} text-brand-700`}><LogOut className="size-4" aria-hidden />Log out</button>
          </div>
        </div>
      )}
    </div>
  );
}
