import { purchaseLimit } from '@/features/catalog';
import { cartActions } from '@/features/cart';
import { serverNow } from '@/shared/http/serverClock';
import { parseApiError } from '@/shared/http/errors';
import { toast } from '@/shared/ui/toast';

/**
 * The one place that turns "add this product" into cart + toast behaviour, so every page behaves the same.
 * Resolves true when something was added, false when it was not (limit reached or error).
 */
export async function addItemToCart(item, qty = 1) {
  const limit = purchaseLimit(item, serverNow());
  if (limit === 0) {
    toast.info('This item is out of stock');
    return false;
  }
  try {
    const result = await cartActions.add(item.id, qty, limit);
    if (!result.ok) {
      toast.info(`You already have the most you can buy (${result.count}).`);
      return false;
    }
    toast.success(result.capped ? `Added. Your limit is ${result.count} for this item.` : 'Added to your cart');
    return true;
  } catch (error) {
    toast.error(parseApiError(error).message);
    return false;
  }
}
