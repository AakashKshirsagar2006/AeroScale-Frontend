// Flip a flag to true once the backend endpoint exists. The UI for it is already in place.
export const features = {
  googleLogin: false,
  githubLogin: false,
  forgotPassword: false,
  // Skips Razorpay and calls POST /api/v1/orders/{id}/simulate-payment instead. Local demos only.
  simulatePayment: import.meta.env.VITE_SIMULATE_PAYMENT === 'true',
};

// How long the backend holds reserved stock while the buyer pays (InventoryServiceImpl.LOCK_TIMEOUT_MINUTES).
// Only used as a fallback when the order response has no `holdExpiresAt`.
export const PAYMENT_HOLD_MINUTES = 5;
