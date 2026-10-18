import { cn } from '../lib/cn';

export function EmptyState({ icon: Icon, title, text, action, className }) {
  return (
    <div className={cn('mx-auto flex max-w-sm flex-col items-center py-16 text-center', className)}>
      {Icon && (
        <span className="grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand">
          <Icon className="size-7" aria-hidden />
        </span>
      )}
      <h2 className="mt-5 text-lg font-bold text-ink">{title}</h2>
      {text && <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
