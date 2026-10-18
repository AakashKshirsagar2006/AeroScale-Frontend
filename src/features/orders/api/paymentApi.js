import { http } from '@/shared/http/client';

export const paymentApi = {
  /** Sends what Razorpay's checkout returned so the backend can verify the signature. */
  confirm: async ({ rzpOrderId, paymentId, signature }) => { await http.post('/api/pay/updatePaymentStatus', { rzpOrderId, paymentId, signature }); },
  /** Dev only: marks the order paid without a real payment. */
  simulate: async (orderId) => { await http.post(`/api/v1/orders/${orderId}/simulate-payment`); },
};
