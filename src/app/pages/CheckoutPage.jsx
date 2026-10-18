import { CircleCheck, MapPinPlus, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { addressActions, AddressCard, AddressForm, useAddresses, useProfile } from '@/features/account';
import { cartActions, useCart } from '@/features/cart';
import { HoldTimer, holdDeadline, orderApi, payOrder } from '@/features/orders';
import { parseApiError } from '@/shared/http/errors';
import { formatPrice, newId } from '@/shared/lib/format';
import { useNow } from '@/shared/lib/useNow';
import { Alert } from '@/shared/ui/Alert';
import { Button, ButtonLink } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Skeleton } from '@/shared/ui/Skeleton';
import { toast } from '@/shared/ui/toast';
import { OrderSummary } from './CartPage';

function Success({ order }) {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <span className="mx-auto grid size-20 animate-pop place-items-center rounded-full bg-success/15 text-success ring-8 ring-success/10">
        <CircleCheck className="size-10" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">Order placed</h1>
      <p className="mt-2 text-slate-700">Payment received for <span className="font-bold">{formatPrice(order.total)}</span>. We will start packing it right away.</p>
      <p className="mt-1 font-mono text-xs text-slate-500">#{order.id.slice(0, 8)}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink to="/orders">View my orders</ButtonLink>
        <ButtonLink to="/" variant="secondary">Keep shopping</ButtonLink>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const cart = useCart();
  const addresses = useAddresses();
  const { profile } = useProfile();
  const now = useNow();

  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [phase, setPhase] = useState('review'); // review | busy | success
  const [order, setOrder] = useState(null);     // set once the backend has created the (PENDING) order
  const [failure, setFailure] = useState(null);
  const idempotencyKey = useRef(newId());       // same key on every retry = never two orders from one click

  useEffect(() => { addressActions.load().catch(() => {}); }, []);
  useEffect(() => {
    if (!selectedId && addresses.defaultAddress) setSelectedId(addresses.defaultAddress.id);
  }, [addresses.defaultAddress, selectedId]);

  if (phase === 'success') return <Success order={order} />;
  if (!order && cart.status === 'ready' && cart.items.length === 0) return <Navigate to="/cart" replace />;

  const pay = async (current) => {
    setPhase('busy');
    try {
      await payOrder(current, { name: profile?.fullName, email: user.email });
      setPhase('success');
      idempotencyKey.current = newId();
    } catch (err) {
      setFailure(parseApiError(err));
      setPhase('review');
    }
  };

  const placeOrder = async () => {
    setFailure(null);
    setPhase('busy');
    try {
      const created = await orderApi.checkout({ shippingAddressId: selectedId, idempotencyKey: idempotencyKey.current });
      setOrder(created);
      cartActions.reload().catch(() => {}); // the backend empties the cart when the order is created
      await pay(created);
    } catch (err) {
      setFailure(parseApiError(err));
      setPhase('review');
    }
  };

  const cancelOrder = async () => {
    setPhase('busy');
    try {
      await orderApi.cancel(order.id);
      idempotencyKey.current = newId(); // the old key now points at a cancelled order
      setOrder(null);
      toast.info('Order cancelled and your items were released.');
    } catch (err) {
      setFailure(parseApiError(err));
    }
    setPhase('review');
  };

  const busy = phase === 'busy';
  const saveAddress = async (values) => { await addresses.add(values); setAdding(false); };

  // ---- an order exists and is waiting for payment ----
  if (order) {
    const expired = holdDeadline(order) <= now;
    return (
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h1 className="text-xl font-extrabold tracking-tight text-ink">Complete your payment</h1>
          <p className="mt-1 text-sm text-slate-700">Your order is created. Pay to confirm it.</p>
          {failure && <Alert key={failure.message} variant="error" className="mt-4">{failure.message}</Alert>}
          <HoldTimer order={order} className="mt-4" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => pay(order)} loading={busy} disabled={expired}>Pay {formatPrice(order.total)}</Button>
            <Button variant="secondary" onClick={cancelOrder} disabled={busy}>Cancel order</Button>
          </div>
        </section>
        <OrderSummary title="Your order" items={order.items.map((i) => ({ unitPrice: i.unitPrice, count: i.quantity }))} />
      </div>
    );
  }

  // ---- review: choose an address, place the order ----
  return (
    <div>
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-ink">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="addr-title" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="addr-title" className="text-base font-bold text-ink">Delivery address</h2>
            <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-700 outline-none hover:bg-brand/10 focus-visible:ring-4 focus-visible:ring-brand/30"><MapPinPlus className="size-4" aria-hidden />Add new</button>
          </div>
          {failure && <Alert key={failure.message} variant="error" className="mb-4">{failure.message}</Alert>}
          {addresses.status === 'loading' && <div className="space-y-3"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></div>}
          {addresses.status === 'ready' && !addresses.items.length && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
              <p className="text-sm text-slate-700">You have no saved address yet.</p>
              <Button className="mt-4" onClick={() => setAdding(true)}>Add an address</Button>
            </div>
          )}
          <div className="space-y-3">
            {addresses.items.map((a) => <AddressCard key={a.id} address={a} mode="select" selected={selectedId === a.id} onSelect={() => setSelectedId(a.id)} />)}
          </div>
        </section>

        <OrderSummary items={cart.items}>
          <Button fullWidth loading={busy} disabled={!selectedId || cart.items.length === 0} onClick={placeOrder}>Place order and pay</Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-600"><ShieldCheck className="size-4 text-success" aria-hidden />Secure payment with Razorpay</p>
          <Link to="/cart" className="mt-3 block text-center text-sm font-semibold text-slate-700 hover:text-brand-700">Back to cart</Link>
        </OrderSummary>
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add a delivery address">
        <AddressForm onSubmit={saveAddress} onCancel={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
