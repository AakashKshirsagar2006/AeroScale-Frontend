/**
 * Backend SellerOrderResponse -> UI shape.
 * One row = ONE order item (one product, one status). `orderId` in the response is the order ITEM's id.
 * `createdAt` is optional: the DTO may not carry it, and the UI hides the date when it is missing.
 */
export const toSellerOrder = (r) => {
  const i = r.item ?? {};
  return {
    id: r.orderId,
    status: r.status, // this item's own status: CONFIRMED | SHIPPED | DELIVERED | CANCELLED
    createdAt: r.createdAt ? Date.parse(r.createdAt) : null,
    address: r.shippingAddress ?? null, // recipientName, recipientPhoneNo, addressLine1...
    item: {
      productId: i.productId,
      name: i.productName ?? 'Product',
      imageUrl: i.imageUrl ?? null,
      quantity: Number(i.quantity ?? 1),
      unitPrice: Number(i.unitPrice ?? 0),
      subTotal: Number(i.subTotal ?? 0),
    },
    total: Number(r.sellerTotal ?? i.subTotal ?? 0), // what the seller earns from this item
  };
};
