import { TrendingUp, ClipboardList, LayoutDashboard, Package, Zap } from 'lucide-react';

// One list feeds both the top bar (md+) and the bottom bar (phones).
export const SELLER_LINKS = [
  { to: '/seller', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/seller/products', label: 'Products', Icon: Package },
  { to: '/seller/orders', label: 'Orders', Icon: ClipboardList },
  { to: '/seller/analytics', label: 'Analytics', Icon: TrendingUp },
  { to: '/seller/flash-sales', label: 'Flash sales', Icon: Zap },
];
