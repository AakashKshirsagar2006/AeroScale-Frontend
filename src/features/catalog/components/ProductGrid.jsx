import { cn } from '@/shared/lib/cn';
import { ProductCardSkeleton } from './ProductCard';

const GRID = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4';

export const ProductGrid = ({ children, className }) => <div className={cn(GRID, className)}>{children}</div>;

export const SkeletonGrid = ({ count = 8, className }) => (
  <div className={cn(GRID, className)} role="status" aria-label="Loading products">
    {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
  </div>
);
