import { Route } from 'react-router-dom';
import { ProtectedRoute, ROLES } from '@/features/auth';
import { SellerLayout } from './layout/SellerLayout';
import AnalyticsPage from './pages/AnalyticsPage';
import DashboardPage from './pages/DashboardPage';
import FlashSalesPage from './pages/FlashSalesPage';
import OrdersPage from './pages/OrdersPage';
import ProductEditorPage from './pages/ProductEditorPage';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';

/** Every seller route in one element. app/routes.jsx drops it into the route table: {sellerRoutes} */
export const sellerRoutes = (
  <Route path="/seller" element={<ProtectedRoute roles={[ROLES.SELLER]}><SellerLayout /></ProtectedRoute>}>
    <Route index element={<DashboardPage />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="products/new" element={<ProductEditorPage />} />
    <Route path="products/:id/edit" element={<ProductEditorPage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="analytics" element={<AnalyticsPage />} />
    <Route path="flash-sales" element={<FlashSalesPage />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>
);
