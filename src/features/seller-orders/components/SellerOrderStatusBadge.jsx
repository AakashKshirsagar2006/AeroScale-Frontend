import { cn } from '@/shared/lib/cn';

const STYLES = {
  CONFIRMED: 'bg-brand/10 text-brand-700',
  SHIPPED: 'bg-violet-100 text-violet-900',
  DELIVERED: 'bg-success/15 text-emerald-800',
  CANCELLED: 'bg-slate-100 text-slate-700',
};
const LABELS = { CONFIRMED: 'Ready to ship', SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };

export const SellerOrderStatusBadge = ({ status }) => (
  <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STYLES[status] ?? STYLES.CANCELLED)}>{LABELS[status] ?? status}</span>
);
