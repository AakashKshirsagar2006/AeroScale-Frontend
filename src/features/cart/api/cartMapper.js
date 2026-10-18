/** Backend CartResponse -> UI shape. Note the backend names: itemName, pricePerItem, CurrentStockOfProduct... */
export const toCartItem = (r) => ({
  id: r.id,
  productId: r.productId,
  name: r.itemName,
  count: r.itemCount,
  unitPrice: Number(r.pricePerItem),
  originalPrice: r.originalPrice != null ? Number(r.originalPrice) : null, // only while a flash sale is live
  stock: r.currentStockOfProduct ?? r.CurrentStockOfProduct ?? null,
  imageUrl: r.imageUrl ?? null,
  maxPerUser: r.maxItemsPerUser ?? null,
  saleEndsAt: r.saleEndsAt ? Date.parse(r.saleEndsAt) : null,
});

// UpdateCartItemRequest.Cartid is serialized by Jackson as `cartid`. Both spellings are sent.
export const toUpdateBody = ({ cartId, count }) => ({ cartid: cartId, Cartid: cartId, itemCount: count });
