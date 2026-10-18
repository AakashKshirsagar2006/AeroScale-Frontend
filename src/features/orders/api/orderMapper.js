/** Backend OrderResponse -> UI shape. `razorPayOrderid` really is spelled with a lowercase "id" in the backend record. */
export const toOrder = (r) => ({
  id: r.orderId,
  status: r.status, // PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
  total: Number(r.totalAmount),
  createdAt: Date.parse(r.createdAt),
  holdExpiresAt: r.holdExpiresAt ? Date.parse(r.holdExpiresAt) : null,
  address: r.shippingAddress ?? null,
  items: (r.items ?? []).map((i) => ({
    productId: i.productId,
    name: i.productName ?? 'Product',
    imageUrl: i.imageUrl ?? null,
    quantity: i.quantity,
    unitPrice: Number(i.unitPrice),
    subTotal: Number(i.subTotal),
  })),
  rzpOrderId: r.razorPayOrderid ?? null,
  rzpKey: r.rzpKey ?? null,
});
