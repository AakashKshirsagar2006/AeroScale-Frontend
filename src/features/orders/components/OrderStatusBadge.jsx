import { cn } from '@/shared/lib/cn';

const STYLES = {
  PENDING: 'bg-amber-100 text-amber-900',
  CONFIRMED: 'bg-accent/15 text-blue-800',
  SHIPPED: 'bg-violet-100 text-violet-900',
  DELIVERED: 'bg-success/15 text-emerald-800',
  CANCELLED: 'bg-slate-100 text-slate-700',
};
const LABELS = { PENDING: 'Awaiting payment', CONFIRMED: 'Confirmed', SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };

export const OrderStatusBadge = ({ status }) => (
  <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STYLES[status] ?? STYLES.CANCELLED)}>{LABELS[status] ?? status}</span>
);
