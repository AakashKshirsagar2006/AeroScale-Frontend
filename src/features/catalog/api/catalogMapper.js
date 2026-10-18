/** Backend JSON -> the shapes the UI uses. The only file that knows the catalog's field names. */
const num = (v) => (v == null ? null : Number(v));
const ms = (v) => (v ? Date.parse(v) : null);

export function toFlashSale(raw, regularPrice) {
  if (!raw) return null;
  const salePrice = num(raw.salePrice);
  const computedOff = regularPrice > 0 && salePrice != null ? Math.round((1 - salePrice / regularPrice) * 100) : 0;
  return {
    id: raw.id,
    startsAt: ms(raw.startTime),
    endsAt: ms(raw.endTime),
    maxPerUser: raw.maxItemsPerUser ?? null,
    salePrice,
    discountPercent: raw.discountPercent ?? computedOff,
    totalQuantity: raw.totalQuantity ?? null,
    soldQuantity: raw.soldQuantity ?? 0,
  };
}

export function toCatalogItem(raw) {
  const price = Number(raw.price);
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    price,
    imageUrl: raw.imageUrl ?? null,
    availableStock: raw.availableStock ?? null, // null = backend did not say
    flashSale: toFlashSale(raw.flashSale, price),
  };
}
