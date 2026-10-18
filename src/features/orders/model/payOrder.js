import { features, PAYMENT_HOLD_MINUTES } from '@/shared/config/features';
import { paymentApi } from '../api/paymentApi';
import { openRazorpay } from './razorpay';

/** Collects payment for a PENDING order. Resolves when the backend has confirmed it. Throws if the buyer backs out or it fails. */
export async function payOrder(order, { name, email } = {}) {
  if (features.simulatePayment) {
    await paymentApi.simulate(order.id);
    return;
  }
  if (!order.rzpKey || !order.rzpOrderId) throw new Error('Payment details are missing for this order. Please refresh and try again.');
  const result = await openRazorpay({ key: order.rzpKey, orderId: order.rzpOrderId, name, email });
  await paymentApi.confirm({ rzpOrderId: result.orderId, paymentId: result.paymentId, signature: result.signature });
}

/** When the reserved stock is released. Prefers the server's exact time, falls back to created + the known hold. */
export const holdDeadline = (order) => order.holdExpiresAt ?? order.createdAt + PAYMENT_HOLD_MINUTES * 60_000;
