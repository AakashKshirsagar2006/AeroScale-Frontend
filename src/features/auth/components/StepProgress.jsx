import { cn } from '@/shared/lib/cn';

export function StepProgress({ steps, current }) {
  return (
    <ol className="flex gap-2" aria-label="Sign up progress">
      {steps.map((label, i) => (
        <li key={label} className="flex-1" aria-current={i === current ? 'step' : undefined}>
          <div className={cn('h-1.5 rounded-full transition-colors duration-500', i <= current ? 'bg-brand' : 'bg-slate-300')} />
          <span className={cn('mt-1.5 block text-xs font-medium', i === current ? 'text-ink' : 'text-slate-600')}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
