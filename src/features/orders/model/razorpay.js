const SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let loading = null;

export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => { loading = null; reject(new Error('Could not load the payment window. Check your connection and try again.')); };
    document.head.appendChild(script);
  });
  return loading;
}

/**
 * Opens Razorpay's checkout popup.
 * Resolves { orderId, paymentId, signature } on success. Rejects with Error.code = 'DISMISSED' when the buyer closes it.
 * A failed attempt inside the popup is NOT final (they can retry there), so we only remember its message.
 */
export async function openRazorpay({ key, orderId, name, email }) {
  const Razorpay = await loadRazorpay();
  return new Promise((resolve, reject) => {
    let lastFailure = null;
    const rzp = new Razorpay({
      key,
      order_id: orderId,
      name: 'AeroScale',
      description: 'Flash sale order',
      prefill: { name, email },
      theme: { color: '#EF4444' },
      handler: (r) => resolve({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
      modal: { ondismiss: () => reject(Object.assign(new Error(lastFailure ?? 'Payment was cancelled.'), { code: 'DISMISSED' })) },
    });
    rzp.on('payment.failed', (r) => { lastFailure = r?.error?.description ?? 'The payment failed.'; });
    rzp.open();
  });
}
