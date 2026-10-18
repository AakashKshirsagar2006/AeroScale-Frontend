import { clamp } from '@/shared/lib/format';

/** 'NONE' | 'UPCOMING' | 'LIVE' | 'ENDED', judged against the server clock so cards flip state by themselves. */
export function saleState(flashSale, now) {
  if (!flashSale) return 'NONE';
  if (now < flashSale.startsAt) return 'UPCOMING';
  if (now >= flashSale.endsAt) return 'ENDED';
  return 'LIVE';
}

/** What the buyer pays per unit right now. */
export const unitPrice = (item, now) =>
  saleState(item.flashSale, now) === 'LIVE' ? item.flashSale.salePrice ?? item.price : item.price;

export const soldPercent = (flashSale) =>
  flashSale?.totalQuantity ? clamp(Math.round((flashSale.soldQuantity / flashSale.totalQuantity) * 100), 0, 100) : 0;

/** Most units one buyer can put in the cart: stock and, during a live sale, the per-user cap. */
export function purchaseLimit(item, now) {
  const stock = item.availableStock ?? 99;
  const cap = saleState(item.flashSale, now) === 'LIVE' ? item.flashSale.maxPerUser ?? 99 : 99;
  return Math.max(0, Math.min(stock, cap));
}

/** Why the item can't be bought right now, or null if it can. */
export function unavailableReason(item, now) {
  const state = saleState(item.flashSale, now);
  if (state === 'UPCOMING') return 'Starts soon';
  if (state === 'ENDED') return 'Sale ended';
  if (item.availableStock === 0) return 'Out of stock';
  return null;
}
