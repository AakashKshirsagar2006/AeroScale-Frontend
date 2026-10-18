import { AxiosError } from 'axios';
import { http } from '../http/client';
import { buildProducts } from './catalogData';
import { readBody } from './readBody';
import { createSellerRoutes } from './sellerMock';

/**
 * In-browser fake of the backend, INCLUDING the endpoints that do not exist yet.
 * Its response shapes are the spec in BACKEND_REQUIRED.md. Start it with `npm run dev:mock`.
 * State survives reloads (localStorage) so you can click through cart -> checkout -> orders.
 */
const KEY = 'aeroscale.mock';
const uuid = () => crypto.randomUUID();
const DEFAULT_ADDRESS = () => ({ id: uuid(), label: 'HOME', recipientName: 'Rahul Sharma', recipientPhoneNo: '+919876543210', addressLine1: '12 MG Road', addressLine2: 'Near City Mall', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001', default: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? null; } catch { return null; }
}
const fresh = () => ({ cart: [], orders: [], addresses: [DEFAULT_ADDRESS()], profile: { fullName: 'Rahul Sharma', dob: '1998-05-14T00:00:00Z', walletBalance: 1250, loyaltyPoint: 340 } });
const db = load() ?? fresh();
/** Back to the starting data (empty cart, no orders, one address). */
export function resetMockData() { Object.assign(db, fresh()); try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* ignore */ } };

class Reply extends Error { constructor(status, body) { super('reply'); this.status = status; this.body = body; } }
const fail = (status, body) => { throw new Reply(status, body); };

const session = (email, role) => ({
  uuid: uuid(), email, role, tokenType: 'Bearer', accessToken: `mock-a.${uuid()}`,
  refreshToken: `mock-r:${role}:${email}`, expiresInSec: 900,
});

const pageOf = (all, { page = 0, size = 10 }) => {
  const p = Number(page), s = Number(size);
  const content = all.slice(p * s, p * s + s);
  return { content, totalElements: all.length, totalPages: Math.ceil(all.length / s), number: p, size: s, first: p === 0, last: (p + 1) * s >= all.length };
};
const strip = ({ createdAt, ...rest }) => rest; // eslint-disable-line no-unused-vars

const effective = (p, now) => {
  const fs = p.flashSale;
  return fs && now >= Date.parse(fs.startTime) && now < Date.parse(fs.endTime) ? fs.salePrice : p.price;
};

function routes(now) {
  const { regular, sale } = buildProducts(now);
  const all = [...sale, ...regular];
  const byId = new Map(all.map((p) => [p.id, p]));
  const cartView = (c) => {
    const p = byId.get(c.productId);
    const live = p.flashSale && effective(p, now) === p.flashSale.salePrice;
    return {
      id: c.id, productId: p.id, itemCount: c.count, itemName: p.name, pricePerItem: effective(p, now),
      currentStockOfProduct: p.availableStock, createdAt: c.createdAt, updatedAt: c.createdAt,
      imageUrl: p.imageUrl, originalPrice: live ? p.price : null,
      maxItemsPerUser: live ? p.flashSale.maxItemsPerUser : null, saleEndsAt: live ? p.flashSale.endTime : null,
    };
  };
  const orderView = (o) => ({ ...o, razorPayOrderid: o.status === 'PENDING' ? o.razorPayOrderid : null, rzpKey: o.status === 'PENDING' ? o.rzpKey : null, holdExpiresAt: o.status === 'PENDING' ? o.holdExpiresAt : null });

  return {
    ...createSellerRoutes({ db, save, fail, pageOf, uuid, now }),

    // ---- auth ----
    'POST /api/auth/login': ({ body }) => session(body.email, /^seller/.test(body.email) ? 'SELLER' : /^admin/.test(body.email) ? 'ADMIN' : 'BUYER'),
    'POST /api/auth/register': ({ body }) => session(body.email, body.role),
    'POST /api/auth/refreshToken': ({ body }) => {
      const [, role, email] = String(body.token).split(':');
      if (!role || !email) fail(417, 'Refresh token is invalid');
      return session(email, role);
    },
    'POST /api/auth/logout': () => 'ok',

    // ---- catalog (new / extended) ----
    'GET /api/v1/catalog/products': ({ params: q }) => {
      let list = q.type === 'REGULAR' ? regular : all;
      if (q.q) list = list.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(String(q.q).toLowerCase()));
      if (q.minPrice) list = list.filter((p) => effective(p, now) >= Number(q.minPrice));
      if (q.maxPrice) list = list.filter((p) => effective(p, now) <= Number(q.maxPrice));
      if (q.inStock) list = list.filter((p) => p.availableStock > 0);
      const [field, dir] = String(q.sort ?? 'createdAt,desc').split(',');
      const key = { price: (p) => effective(p, now), name: (p) => p.name, createdAt: (p) => p.createdAt }[field] ?? ((p) => p.createdAt);
      list = [...list].sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * (dir === 'desc' ? -1 : 1));
      return pageOf(list.map(strip), q);
    },
    'GET /api/v1/catalog/flash-sales': ({ params: q }) => {
      const state = q.state === 'UPCOMING' ? 'UPCOMING' : 'LIVE';
      const key = state === 'LIVE' ? 'endTime' : 'startTime';
      const list = sale.filter((p) => p.flashSale.state === state).sort((a, b) => Date.parse(a.flashSale[key]) - Date.parse(b.flashSale[key]));
      return pageOf(list.map(strip), q);
    },
    'GET /api/v1/catalog/products/:id': ({ args }) => {
      const p = byId.get(args.id);
      if (!p) fail(404, { type: 'about:blank', title: 'Product Not Found', status: 404, detail: 'Product not found' });
      return strip(p);
    },

    // ---- cart (existing endpoints, richer responses) ----
    'GET /api/cart/getCart': () => db.cart.map(cartView),
    'POST /api/cart/addToCart': ({ body }) => {
      const p = byId.get(body.productId);
      if (!p) fail(417, 'Item not Found');
      if (p.availableStock < body.count) fail(507, `Only ${p.availableStock} Units of ${p.name} are available`);
      const existing = db.cart.find((c) => c.productId === body.productId);
      if (existing) existing.count = body.count; else db.cart.push({ id: uuid(), productId: body.productId, count: body.count, createdAt: new Date().toISOString() });
      save();
    },
    'PUT /api/cart/updateCart': ({ body }) => {
      const c = db.cart.find((x) => x.id === (body.cartid ?? body.Cartid));
      if (!c) fail(404, 'Product Not Found in your Cart!!');
      const p = byId.get(c.productId);
      if (p.availableStock < body.itemCount) fail(507, `Only ${p.availableStock} Units of ${p.name} are available`);
      c.count = body.itemCount; save();
    },
    'DELETE /api/cart/deleteFromCart/:id': ({ args }) => { db.cart = db.cart.filter((c) => c.id !== args.id); save(); },
    'DELETE /api/cart/clearCart': () => { db.cart = []; save(); },

    // ---- buyer ----
    'GET /api/buyer/profile': () => ({ id: uuid(), email: localStorage.getItem('aeroscale.mockEmail') ?? 'buyer@aeroscale.com', ...db.profile }),
    'POST /api/buyer/updateProfile': ({ body }) => { db.profile = { ...db.profile, fullName: body.fullName, dob: body.dob }; save(); },
    'GET /api/buyer/getAllAddress': () => db.addresses,
    'POST /api/buyer/addAddress': ({ body }) => {
      if (body.default) db.addresses.forEach((a) => { a.default = false; });
      db.addresses.push({ id: uuid(), label: body.label, recipientName: body.recipientName, recipientPhoneNo: body.phoneNo, addressLine1: body.addressLine1, addressLine2: body.addressLine2, city: body.city, state: body.state, country: body.country, pincode: body.pincode, default: Boolean(body.default) || !db.addresses.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      save();
    },
    'PUT /api/buyer/updateAddress/:id': ({ args, body }) => {
      const a = db.addresses.find((x) => x.id === args.id);
      if (!a) fail(417, 'Address not found');
      if (body.default) db.addresses.forEach((x) => { x.default = false; });
      Object.assign(a, { label: body.label, recipientName: body.recipientName, recipientPhoneNo: body.phoneNo, addressLine1: body.addressLine1, addressLine2: body.addressLine2, city: body.city, state: body.state, country: body.country, pincode: body.pincode, default: Boolean(body.default) || a.default });
      save();
    },
    'DELETE /api/buyer/deleteAddress/:id': ({ args }) => { db.addresses = db.addresses.filter((a) => a.id !== args.id); save(); },

    // ---- orders + payment ----
    'POST /api/v1/orders/checkout': ({ body }) => {
      const dup = db.orders.find((o) => o.idempotencyKey === body.idempotencyKey);
      if (dup) return orderView(dup);
      if (!db.cart.length) fail(400, { title: 'Cart is Empty', status: 400, detail: 'Cannot place an order with an empty cart' });
      const a = db.addresses.find((x) => x.id === body.shippingAddressId);
      if (!a) fail(417, 'Address not found');
      const items = db.cart.map((c) => {
        const p = byId.get(c.productId); const unit = effective(p, now);
        if (p.flashSale && effective(p, now) === p.price && Date.parse(p.flashSale.startTime) > now) fail(409, { title: 'Inventory Conflict', status: 409, detail: 'The flash sale for this item has not started yet.' });
        return { productId: p.id, productName: p.name, imageUrl: p.imageUrl, quantity: c.count, unitPrice: unit, subTotal: unit * c.count };
      });
      const o = {
        orderId: uuid(), idempotencyKey: body.idempotencyKey, buyerId: uuid(), status: 'PENDING', createdAt: new Date(now).toISOString(),
        holdExpiresAt: new Date(now + 5 * 60_000).toISOString(), totalAmount: items.reduce((n, i) => n + i.subTotal, 0), items,
        shippingAddress: { recipientName: a.recipientName, recipientPhoneNo: a.recipientPhoneNo, addressLine1: a.addressLine1, addressLine2: a.addressLine2, city: a.city, state: a.state, pincode: a.pincode, country: a.country },
        razorPayOrderid: `order_mock${Math.random().toString(36).slice(2, 10)}`, rzpKey: 'rzp_test_mock',
      };
      db.orders.unshift(o); db.cart = []; save();
      return orderView(o);
    },
    'GET /api/v1/orders': ({ params }) => pageOf(db.orders.map(orderView), params),
    'DELETE /api/v1/orders/:id/cancel': ({ args }) => {
      const o = db.orders.find((x) => x.orderId === args.id);
      if (!o) fail(500, 'Order not found or access denied');
      if (o.status !== 'PENDING') fail(409, { title: 'Inventory Conflict', status: 409, detail: 'Only PENDING orders can be cancelled' });
      o.status = 'CANCELLED'; save();
    },
    'POST /api/v1/orders/:id/simulate-payment': ({ args }) => {
      const o = db.orders.find((x) => x.orderId === args.id);
      if (!o) fail(500, 'Order not found');
      o.status = 'CONFIRMED'; save();
    },
    'POST /api/pay/updatePaymentStatus': ({ body }) => {
      const o = db.orders.find((x) => x.razorPayOrderid === body.rzpOrderId);
      if (o) { o.status = 'CONFIRMED'; save(); }
    },
  };
}

function match(table, method, path) {
  for (const key of Object.keys(table)) {
    const [m, pattern] = key.split(' ');
    if (m !== method) continue;
    const names = [];
    const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, n) => { names.push(n); return '([^/]+)'; })}$`);
    const hit = path.match(re);
    if (hit) return { handler: table[key], args: Object.fromEntries(names.map((n, i) => [n, hit[i + 1]])) };
  }
  return null;
}

export function installMockApi({ latency = 280 } = {}) {
  if (typeof window !== 'undefined') console.info('%cAeroScale mock API is ON', 'color:#ef4444;font-weight:bold', '(no backend needed)');
  http.defaults.adapter = async (config) => {
    const method = config.method.toUpperCase();
    const path = config.url.split('?')[0];
    const now = Date.now();
    (globalThis.__mockCalls ??= []).push(`${method} ${path}${config.params ? '?' + new URLSearchParams(config.params) : ''}`); // lets tests see which pages were fetched
    await new Promise((r) => setTimeout(r, latency + Math.random() * latency * 0.6));

    const respond = (status, data) => {
      const response = { data, status, statusText: '', headers: { date: new Date().toUTCString() }, config, request: {} };
      return status < 300 ? response : Promise.reject(new AxiosError('mock', 'ERR_MOCK', config, {}, response));
    };
    // The real JWT filter rejects a stale Bearer token before anything else. Mock tokens never expire.
    const hit = match(routes(now), method, path);
    if (!hit) return respond(404, `No mock for ${method} ${path}`);
    const publicPath = ['/api/auth/login', '/api/auth/register', '/api/auth/refreshToken'].includes(path);
    if (!publicPath && !config.headers?.get?.('Authorization') && !config.headers?.Authorization) return respond(401, '');
    try {
      const body = await readBody(config.data);
      if (path === '/api/auth/login' || path === '/api/auth/register') localStorage.setItem('aeroscale.mockEmail', body.email);
      const data = hit.handler({ body, params: config.params ?? {}, args: hit.args });
      return respond(method === 'GET' && path.startsWith('/api/v1/catalog') ? 200 : method === 'GET' ? 200 : 201, data ?? '');
    } catch (e) {
      if (e instanceof Reply) return respond(e.status, e.body);
      throw e;
    }
  };
}
