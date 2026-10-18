import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const LOOK = {
  VERIFIED: { label: 'Verified seller', Icon: ShieldCheck, cls: 'bg-success/15 text-emerald-800' },
  PENDING: { label: 'Verification pending', Icon: Shield, cls: 'bg-amber-100 text-amber-900' },
  REJECTED: { label: 'Verification rejected', Icon: ShieldAlert, cls: 'bg-brand/10 text-brand-700' },
  SUSPENDED: { label: 'Account suspended', Icon: ShieldAlert, cls: 'bg-brand/10 text-brand-700' },
};

export function VerificationBadge({ status, className }) {
  const { label, Icon, cls } = LOOK[status] ?? LOOK.PENDING;
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', cls, className)}><Icon className="size-3.5" aria-hidden />{label}</span>;
}
