import { ProductCard, ProductGrid, SkeletonGrid } from '@/features/catalog';
import { useCart } from '@/features/cart';
import { useInfiniteList } from '@/shared/lib/useInfiniteList';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/shared/ui/ErrorState';
import { addItemToCart } from '../hooks/useAddToCart';

/**
 * Loads a few products first, then the next page each time the end of the list nears the viewport.
 * `fetchPage(pageIndex)` -> { items, hasMore }. The list restarts when `deps` change.
 */
export function InfiniteProductGrid({ fetchPage, deps, empty }) {
  const list = useInfiniteList(fetchPage, deps);
  const { byProduct } = useCart();

  if (list.status === 'loading') return <SkeletonGrid count={8} />;
  if (list.status === 'error') return <ErrorState error={list.error} onRetry={list.reload} title="Could not load products" />;
  if (!list.items.length) return empty;

  return (
    <>
      <ProductGrid>
        {list.items.map((item) => (
          <ProductCard key={item.id} item={item} onAdd={addItemToCart} inCart={byProduct.get(item.id)?.count ?? 0} />
        ))}
      </ProductGrid>

      {list.loadingMore && <SkeletonGrid count={4} className="mt-4" />}
      {list.error && (
        <div className="mt-6 flex justify-center"><Button variant="secondary" onClick={list.retry}>Could not load more. Try again</Button></div>
      )}
      {list.hasMore
        ? <div ref={list.sentinelRef} aria-hidden className="h-px" />
        : <p className="py-10 text-center text-sm text-slate-600">You have seen it all. New drops land every day.</p>}
    </>
  );
}
