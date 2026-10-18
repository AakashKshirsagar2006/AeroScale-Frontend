import { cn } from '@/shared/lib/cn';

const STYLES = { ACTIVE: 'bg-success/15 text-emerald-800', DRAFT: 'bg-amber-100 text-amber-900', ARCHIVED: 'bg-slate-100 text-slate-700' };
const LABELS = { ACTIVE: 'Active', DRAFT: 'Draft', ARCHIVED: 'Archived' };

export const ProductStatusBadge = ({ status, className }) => (
  <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STYLES[status] ?? STYLES.ARCHIVED, className)}>{LABELS[status] ?? status}</span>
);
