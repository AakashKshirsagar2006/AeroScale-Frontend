import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthPage, GuestRoute, ProtectedRoute, ROLES } from '@/features/auth';
import { BuyerLayout } from './layout/BuyerLayout';
import AccountPage from './pages/AccountPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { AdminHome } from './pages/DashboardStub';
import FlashSalesPage from './pages/FlashSalesPage';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import { sellerRoutes } from './seller/routes';

/**
 * The route table is the only place that connects features together.
 * New module? Add its pages here, wrapped in <ProtectedRoute roles={[...]}>.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><AuthPage mode="login" /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><AuthPage mode="register" /></GuestRoute>} />

      <Route element={<ProtectedRoute roles={[ROLES.BUYER]}><BuyerLayout /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="flash-sales" element={<FlashSalesPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>

      {sellerRoutes}
      <Route path="/admin" element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminHome /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
