import { seedSeller } from './sellerData';

const PAID = new Set(['CONFIRMED', 'SHIPPED', 'DELIVERED']);
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Mock of every seller endpoint. Shapes match BACKEND_SELLER.md. `h` = helpers from mockApi (db, save, fail, pageOf, uuid). */
export function createSellerRoutes({ db, save, fail, pageOf, uuid, now }) {
  db.seller ??= seedSeller(now);
  const s = db.seller;
  const notFound = () => fail(404, { title: 'Product Not Found', status: 404, detail: 'Product not found or you do not have permission to access it' });
  const product = (id) => s.products.find((p) => p.id === id) ?? notFound();
  const paid = () => s.orders.filter((o) => PAID.has(o.status));

  return {
    'GET /api/seller/profile': () => {
      const orders = paid();
      return { ...s.profile, email: localStorage.getItem('aeroscale.mockEmail') ?? 'seller@aeroscale.com', totalOrdersFullFilled: orders.length, totalRevenue: orders.reduce((n, o) => n + o.sellerTotal, 0) };
    },
    'PUT /api/seller/updateProfile': ({ body }) => {
      if (!body.bussinessName?.trim()) fail(400, 'Field error in object on field \'bussinessName\': default message [BussinessName is Required]');
      Object.assign(s.profile, { bussinessName: body.bussinessName, dob: body.dob ?? body.DOB, bussinessAddress: body.bussinessAddress, wareHousePinCode: body.wareHousePincode });
      save();
    },

    'GET /api/v1/seller/products': ({ params: q }) => {
      let list = s.products;
      if (q.status) list = list.filter((p) => p.status === q.status);
      if (q.q) list = list.filter((p) => p.name.toLowerCase().includes(String(q.q).toLowerCase()));
      const [field, dir] = String(q.sort ?? 'createdAt,desc').split(',');
      list = [...list].sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * (dir === 'desc' ? -1 : 1));
      return pageOf(list, q);
    },
    'GET /api/v1/seller/products/:id': ({ args }) => product(args.id),
    'POST /api/v1/seller/products': ({ body }) => {
      const b = body.product;
      if (!b?.name?.trim()) fail(400, { title: 'Bad Request', status: 400, detail: 'Validation failed', errors: { name: 'Product name cannot be blank' } });
      const t = new Date().toISOString();
      const p = { id: uuid(), name: b.name, description: b.description ?? '', price: b.price, imageUrl: body.image ?? null, status: b.status, totalStock: 0, availableStock: 0, createdAt: t, updatedAt: t };
      s.products.unshift(p); save();
      return p;
    },
    'PUT /api/v1/seller/products/:id': ({ args, body }) => {
      const p = product(args.id); const b = body.product;
      Object.assign(p, { name: b.name, description: b.description ?? '', price: b.price, status: b.status, updatedAt: new Date().toISOString() });
      if (body.image) p.imageUrl = body.image;
      save();
      return p;
    },
    'PATCH /api/v1/seller/products/:id/stock': ({ args, body }) => {
      const p = product(args.id);
      if (!(body.quantity >= 1)) fail(400, { title: 'Bad Request', status: 400, detail: 'Validation failed', errors: { quantity: 'Must add at least 1 item' } });
      p.totalStock += body.quantity; p.availableStock += body.quantity; save();
    },
    'DELETE /api/v1/seller/products/:id': ({ args }) => { product(args.id).status = 'ARCHIVED'; save(); },

    // The real endpoint answers a plain List<SellerOrderResponse>: no paging, no createdAt.
    'GET /api/v1/seller/orders': ({ params: q }) =>
      s.orders.filter((o) => !q.status || o.status === q.status).map(({ orderId, status, shippingAddress, item, sellerTotal }) => ({
        orderId, status, shippingAddress, sellerTotal,
        item: { productId: item.productId, productName: item.productName, imageUrl: item.imageUrl, quantity: item.quantity, unitPrice: item.unitPrice, subTotal: item.subTotal },
      })),
    'PATCH /api/v1/seller/orders/:id/status': ({ args, body }) => { // :id = order item id
      const o = s.orders.find((x) => x.orderId === args.id) ?? fail(404, 'Order not found');
      const ok = (o.status === 'CONFIRMED' && body.status === 'SHIPPED') || (o.status === 'SHIPPED' && body.status === 'DELIVERED');
      if (!ok) fail(409, { title: 'Invalid status change', status: 409, detail: `An order that is ${o.status} cannot become ${body.status}` });
      o.status = body.status; save();
    },

    'GET /api/v1/seller/analytics': ({ params: q }) => {
      const days = [7, 30, 90].includes(Number(q.days)) ? Number(q.days) : 30;
      const end = new Date(now); end.setHours(0, 0, 0, 0);
      const from = new Date(end); from.setDate(end.getDate() - (days - 1));
      const prevFrom = new Date(from); prevFrom.setDate(from.getDate() - days);
      const inRange = (o, a, b) => { const t = new Date(o.createdAt); t.setHours(0, 0, 0, 0); return t >= a && t <= b; };
      const prevEnd = new Date(from); prevEnd.setDate(from.getDate() - 1);

      const cur = s.orders.filter((o) => inRange(o, from, end));
      const prev = s.orders.filter((o) => inRange(o, prevFrom, prevEnd) && PAID.has(o.status));
      const curPaid = cur.filter((o) => PAID.has(o.status));
      const units = (list) => list.reduce((n, o) => n + o.item.quantity, 0);
      const sum = (list) => list.reduce((n, o) => n + o.sellerTotal, 0);

      const byDay = new Map();
      curPaid.forEach((o) => {
        const k = dayKey(new Date(o.createdAt));
        const row = byDay.get(k) ?? { date: k, revenue: 0, orders: 0, unitsSold: 0 };
        row.revenue += o.sellerTotal; row.orders += 1; row.unitsSold += o.item.quantity;
        byDay.set(k, row);
      });
      const top = new Map();
      curPaid.forEach((o) => {
        const i = o.item;
        const row = top.get(i.productId) ?? { productId: i.productId, name: i.productName, imageUrl: i.imageUrl, unitsSold: 0, revenue: 0 };
        row.unitsSold += i.quantity; row.revenue += i.subTotal; top.set(i.productId, row);
      });
      const statusCount = {};
      cur.forEach((o) => { statusCount[o.status] = (statusCount[o.status] ?? 0) + 1; });
      let flash = 0, regular = 0;
      curPaid.forEach((o) => { if (o.item.flash) flash += o.item.subTotal; else regular += o.item.subTotal; });

      return {
        rangeDays: days, from: dayKey(from), to: dayKey(end),
        summary: { revenue: sum(curPaid), orders: curPaid.length, unitsSold: units(curPaid), previousRevenue: sum(prev), previousOrders: prev.length, previousUnitsSold: units(prev) },
        daily: [...byDay.values()],
        statusBreakdown: Object.entries(statusCount).map(([status, count]) => ({ status, count })),
        topProducts: [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
        revenueBySource: { flashSale: flash, regular },
      };
    },

    'GET /api/v1/flash-sales': ({ params: q }) => pageOf(s.sales.filter((x) => !q.status || x.status === q.status), q),
    'POST /api/v1/flash-sales': ({ body }) => {
      const p = product(body.productId);
      if (s.sales.some((x) => x.productId === p.id && ['SCHEDULED', 'ACTIVE'].includes(x.status))) fail(409, { title: 'Conflict', status: 409, detail: 'This product already has a sale scheduled or running' });
      s.sales.unshift({ id: uuid(), productId: p.id, productName: p.name, imageUrl: p.imageUrl, productPrice: p.price, salePrice: body.salePrice, discountPercent: Math.round((1 - body.salePrice / p.price) * 100), startTime: body.startTime, endTime: body.endTime, maxItemsPerUser: body.maxItemsPerUser, totalQuantity: body.totalQuantity, soldQuantity: 0, status: 'SCHEDULED' });
      save();
    },
    'DELETE /api/v1/flash-sales/:id': ({ args }) => {
      const x = s.sales.find((v) => v.id === args.id) ?? fail(404, 'Flash sale not found');
      if (x.status !== 'SCHEDULED') fail(409, { title: 'Conflict', status: 409, detail: 'Only a sale that has not started can be cancelled' });
      x.status = 'CANCELLED'; save();
    },
  };
}
