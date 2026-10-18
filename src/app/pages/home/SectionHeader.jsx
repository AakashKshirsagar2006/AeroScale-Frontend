import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SectionHeader({ title, live = false, subtitle, to, linkLabel = 'View all', id }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          {live && <span aria-hidden className="size-2.5 animate-glow rounded-full bg-brand" />}
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-brand-700 outline-none hover:bg-brand/10 focus-visible:ring-4 focus-visible:ring-brand/30">
          {linkLabel}<ChevronRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
