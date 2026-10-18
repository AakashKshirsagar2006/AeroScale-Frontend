import { PackageSearch, Zap } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { catalogApi, FilterBar, ProductCard, ProductGrid, SkeletonGrid, TrustStrip } from '@/features/catalog';
import { useCart } from '@/features/cart';
import { useAsync } from '@/shared/lib/useAsync';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { ButtonLink } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { InfiniteProductGrid } from '../components/InfiniteProductGrid';
import { addItemToCart } from '../hooks/useAddToCart';
import { HeroBanner } from './home/HeroBanner';
import { SectionHeader } from './home/SectionHeader';

const PAGE_SIZE = 12;

/** Filter bar + infinite grid. `fixed` carries what the page decides (search text, REGULAR vs ALL). */
function CatalogFeed({ fixed, emptyTitle, emptyText }) {
  const [filters, setFilters] = useState({ sort: 'createdAt,desc', minPrice: '', maxPrice: '', inStock: false });
  const min = useDebouncedValue(filters.minPrice);
  const max = useDebouncedValue(filters.maxPrice);

  return (
    <>
      <FilterBar value={filters} onChange={setFilters} className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4" />
      <InfiniteProductGrid
        deps={[fixed.q, fixed.type, filters.sort, min, max, filters.inStock]}
        fetchPage={(page) => catalogApi.listProducts({ page, size: PAGE_SIZE, sort: filters.sort, minPrice: min, maxPrice: max, inStock: filters.inStock, ...fixed })}
        empty={<EmptyState icon={PackageSearch} title={emptyTitle} text={emptyText} />}
      />
    </>
  );
}

function FlashPreview({ live }) {
  const { byProduct } = useCart();
  return (
    <section aria-labelledby="flash-title">
      <SectionHeader id="flash-title" title="Live flash sales" live subtitle="Ending soonest first" to="/flash-sales" />
      {live.status === 'loading' && <SkeletonGrid count={4} />}
      {live.status === 'error' && <ErrorState error={live.error} onRetry={live.reload} title="Could not load flash sales" />}
      {live.status === 'ready' && (live.data.items.length ? (
        <ProductGrid>
          {live.data.items.map((item) => <ProductCard key={item.id} item={item} onAdd={addItemToCart} inCart={byProduct.get(item.id)?.count ?? 0} />)}
        </ProductGrid>
      ) : (
        <EmptyState icon={Zap} title="No flash sale is live right now" text="Sales start without warning. See what is coming up next."
          action={<ButtonLink to="/flash-sales?state=UPCOMING" variant="secondary">See upcoming sales</ButtonLink>} />
      ))}
    </section>
  );
}

export default function HomePage() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  // First page only (8). The full list lives on /flash-sales and loads as you scroll.
  const live = useAsync(() => catalogApi.listFlashSales({ page: 0, size: 8, state: 'LIVE' }), []);

  if (q) {
    return (
      <section aria-labelledby="results-title">
        <SectionHeader id="results-title" title={`Results for "${q}"`} subtitle="Regular and flash-sale products" />
        <CatalogFeed fixed={{ q, type: 'ALL' }} emptyTitle="Nothing matched your search" emptyText="Try a shorter word, or check the spelling." />
      </section>
    );
  }

  return (
    <div className="space-y-10">
      <HeroBanner items={live.data?.items ?? []} loading={live.status === 'loading'} />
      <TrustStrip />
      <FlashPreview live={live} />
      <section id="explore" aria-labelledby="explore-title" className="scroll-mt-24">
        <SectionHeader id="explore-title" title="Explore products" subtitle="Everyday prices. Scroll for more." />
        <CatalogFeed fixed={{ type: 'REGULAR' }} emptyTitle="No products yet" emptyText="Sellers are adding products. Check back soon." />
      </section>
    </div>
  );
}
