import { Check, Circle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { PASSWORD_RULES } from '../model/schemas';

const LEVELS = {
  weak: { label: 'Weak', bar: 'bg-brand', text: 'text-brand-700' },
  fair: { label: 'Almost there', bar: 'bg-amber-500', text: 'text-amber-700' },
  strong: { label: 'Strong password', bar: 'bg-success', text: 'text-emerald-700' },
};

export function PasswordChecklist({ value = '' }) {
  const results = PASSWORD_RULES.map((rule) => ({ ...rule, ok: rule.test(value) }));
  const score = results.filter((r) => r.ok).length;
  const level = score === PASSWORD_RULES.length ? LEVELS.strong : score >= 3 ? LEVELS.fair : LEVELS.weak;

  return (
    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="flex gap-1.5" aria-hidden>
        {PASSWORD_RULES.map((rule, i) => (
          <span key={rule.id} className={cn('h-1.5 flex-1 rounded-full transition-colors', i < score ? level.bar : 'bg-slate-200')} />
        ))}
      </div>
      <p className={cn('mt-2 text-xs font-semibold', value ? level.text : 'text-slate-600')} aria-live="polite">
        {value ? level.label : 'Your password needs all of these:'}
      </p>
      <ul className="mt-2 grid gap-x-3 gap-y-1 sm:grid-cols-2">
        {results.map((r) => (
          <li key={r.id} className={cn('flex items-center gap-1.5 text-xs transition-colors', r.ok ? 'font-medium text-emerald-700' : 'text-slate-600')}>
            {r.ok ? <Check className="size-3.5 shrink-0" aria-hidden /> : <Circle className="size-3.5 shrink-0" aria-hidden />}
            {r.label}
            <span className="sr-only">{r.ok ? ' (done)' : ' (missing)'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
