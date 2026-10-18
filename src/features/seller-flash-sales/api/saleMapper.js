const ms = (v) => (v ? Date.parse(v) : null);

/** Backend SellerFlashSaleResponse -> UI shape. `flashSale` has the same shape the catalog's SaleTimer/StockMeter read. */
export function toSellerSale(r) {
  const price = Number(r.productPrice);
  const salePrice = Number(r.salePrice);
  return {
    id: r.id,
    productId: r.productId,
    productName: r.productName,
    imageUrl: r.imageUrl ?? null,
    price,
    salePrice,
    discountPercent: r.discountPercent ?? (price > 0 ? Math.round((1 - salePrice / price) * 100) : 0),
    status: r.status, // SCHEDULED | ACTIVE | ENDED | CANCELLED
    flashSale: {
      startsAt: ms(r.startTime), endsAt: ms(r.endTime), maxPerUser: r.maxItemsPerUser,
      salePrice, discountPercent: r.discountPercent ?? 0, totalQuantity: r.totalQuantity, soldQuantity: r.soldQuantity ?? 0,
    },
  };
}

/** Form -> ScheduleFlashSaleRequest. The browser gives local time; the backend wants an Instant, so we send UTC ISO. */
export const toScheduleBody = (f) => ({
  productId: f.productId,
  startTime: new Date(f.startTime).toISOString(),
  endTime: new Date(f.endTime).toISOString(),
  maxItemsPerUser: Number(f.maxItemsPerUser),
  salePrice: Number(f.salePrice),
  totalQuantity: Number(f.totalQuantity),
});
