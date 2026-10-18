// Deterministic demo store for the seller module (mock mode only). Same seed = same orders every time.
const mulberry = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const hex = (rand) => Array.from({ length: 32 }, () => Math.floor(rand() * 16).toString(16)).join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

const PRODUCTS = [
  ['Sony WH-1000XM5 Headphones', 29990, 42, 'ACTIVE'], ['Apple AirPods Pro (2nd gen)', 24900, 3, 'ACTIVE'], ['Samsung Galaxy S24', 74999, 18, 'ACTIVE'],
  ['JBL Flip 6 Speaker', 9999, 65, 'ACTIVE'], ['Logitech MX Master 3S Mouse', 9495, 0, 'ACTIVE'], ['Keychron K2 Wireless Keyboard', 8499, 27, 'ACTIVE'],
  ['Canon EOS 200D II Camera', 48990, 9, 'ACTIVE'], ['Noise ColorFit Pro Smartwatch', 3999, 120, 'ACTIVE'], ['Anker 65W GaN Charger', 3499, 88, 'DRAFT'],
  ['boAt Rockerz 450 Headphones', 1499, 200, 'ACTIVE'], ['LG 43in 4K Smart TV', 32990, 11, 'DRAFT'], ['GoPro HERO11 Black Camera', 41990, 5, 'ARCHIVED'],
];
const NAMES = ['Aarav Mehta', 'Diya Nair', 'Kabir Singh', 'Ananya Rao', 'Rohan Gupta', 'Ishita Shah', 'Vihaan Joshi', 'Meera Iyer', 'Arjun Patel', 'Sara Khan'];
const CITIES = [['Mumbai', 'Maharashtra', '400001'], ['Pune', 'Maharashtra', '411001'], ['Bengaluru', 'Karnataka', '560001'], ['Delhi', 'Delhi', '110001'], ['Chennai', 'Tamil Nadu', '600001']];

export function seedSeller(now = Date.now()) {
  const rand = mulberry(42);
  const day = 86_400_000;
  const products = PRODUCTS.map(([name, price, stock, status], i) => ({
    id: hex(rand), name, description: `${name}. Genuine product with brand warranty and free delivery.`, price, imageUrl: null, status,
    totalStock: stock + Math.round(stock * 0.3), availableStock: stock, createdAt: new Date(now - (60 - i * 4) * day).toISOString(), updatedAt: new Date(now - i * day).toISOString(),
  }));
  const sellable = products.filter((p) => p.status === 'ACTIVE');

  const orders = [];
  for (let d = 89; d >= 0; d--) {
    const weekday = new Date(now - d * day).getDay();
    const base = (weekday === 0 || weekday === 6 ? 2.6 : 1.6) * (0.55 + (90 - d) / 90 * 0.9); // busier at weekends, growing over time
    const count = Math.max(0, Math.round(base + (rand() - 0.5) * 2.4));
    for (let k = 0; k < count; k++) {
      const p = sellable[Math.floor(rand() ** 1.6 * sellable.length)];
      const flash = rand() > 0.82;
      const unitPrice = flash ? Math.round(p.price * 0.78) : p.price;
      const quantity = 1 + (rand() > 0.85 ? 1 : 0);
      const item = { productId: p.id, productName: p.name, imageUrl: p.imageUrl, quantity, unitPrice, subTotal: unitPrice * quantity, flash };
      const age = d;
      const status = age > 9 ? (rand() > 0.07 ? 'DELIVERED' : 'CANCELLED') : age > 3 ? (rand() > 0.5 ? 'DELIVERED' : 'SHIPPED') : age > 0 ? (rand() > 0.5 ? 'SHIPPED' : 'CONFIRMED') : 'CONFIRMED';
      const [city, state, pincode] = CITIES[Math.floor(rand() * CITIES.length)];
      orders.push({
        orderId: hex(rand), status, createdAt: new Date(now - d * day - Math.floor(rand() * 12 * 3_600_000)).toISOString(),
        shippingAddress: { recipientName: NAMES[Math.floor(rand() * NAMES.length)], recipientPhoneNo: `+9198${Math.floor(10000000 + rand() * 89999999)}`, addressLine1: `${Math.floor(1 + rand() * 90)} MG Road`, addressLine2: '', city, state, pincode, country: 'India' },
        item, sellerTotal: item.subTotal,
      });
    }
  }
  orders.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const at = (h) => new Date(now + h * 3_600_000).toISOString();
  const sale = (p, status, start, end, pct, qty, sold) => ({ id: hex(rand), productId: p.id, productName: p.name, imageUrl: p.imageUrl, productPrice: p.price, salePrice: Math.round(p.price * (1 - pct / 100)), discountPercent: pct, startTime: at(start), endTime: at(end), maxItemsPerUser: 2, totalQuantity: qty, soldQuantity: sold, status });
  const sales = [
    sale(sellable[0], 'ACTIVE', -3, 5, 25, 40, 31), sale(sellable[3], 'SCHEDULED', 20, 44, 30, 30, 0),
    sale(sellable[2], 'ENDED', -80, -56, 20, 20, 20),
  ];

  return {
    profile: { id: hex(rand), bussinessName: 'Rahul Electronics', bussinessAddress: '12 MG Road, Mumbai', wareHousePinCode: '400001', dob: '1990-03-22T00:00:00Z', verificationStatus: 'VERIFIED', rating: 4.6, maxConcurrentFlashSaleSlots: 5, createdAt: new Date(now - 200 * day).toISOString() },
    products, orders, sales,
  };
}
