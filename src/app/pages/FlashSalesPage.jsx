import { Zap } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { catalogApi } from '@/features/catalog';
import { cn } from '@/shared/lib/cn';
import { EmptyState } from '@/shared/ui/EmptyState';
import { InfiniteProductGrid } from '../components/InfiniteProductGrid';
import { SectionHeader } from './home/SectionHeader';

const TABS = [
  { state: 'LIVE', label: 'Live now' },
  { state: 'UPCOMING', label: 'Starting soon' },
];

export default function FlashSalesPage() {
  const [params, setParams] = useSearchParams();
  const state = params.get('state') === 'UPCOMING' ? 'UPCOMING' : 'LIVE';

  return (
    <section aria-labelledby="flash-page-title">
      <SectionHeader id="flash-page-title" title="Flash sales" live={state === 'LIVE'}
        subtitle={state === 'LIVE' ? 'Ending soonest first. Prices drop back when the timer hits zero.' : 'Set a reminder in your head. These go live soon.'} />

      <div role="tablist" aria-label="Sale status" className="mb-6 inline-flex rounded-xl bg-slate-200/70 p-1">
        {TABS.map((t) => (
          <button key={t.state} role="tab" aria-selected={state === t.state} type="button"
            onClick={() => setParams(t.state === 'LIVE' ? {} : { state: t.state })}
            className={cn('rounded-lg px-5 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-accent/30', state === t.state ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink')}>
            {t.label}
          </button>
        ))}
      </div>

      <InfiniteProductGrid
        deps={[state]}
        fetchPage={(page) => catalogApi.listFlashSales({ page, size: 8, state })}
        empty={<EmptyState icon={Zap} title={state === 'LIVE' ? 'No sale is live right now' : 'Nothing scheduled yet'} text="Sellers schedule new flash sales all the time. Check back soon." />}
      />
    </section>
  );
}
