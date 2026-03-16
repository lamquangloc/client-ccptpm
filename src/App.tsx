import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './layouts/Layout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ProductPage from './pages/ProductPage';
import BookingPage from './pages/BookingPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminTablesPage from './pages/admin/AdminTablesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminRoute from './components/AdminRoute';
import NotFoundPage from './pages/NotFoundPage';

/** Wraps admin pages with the sidebar AdminLayout */
function AdminShell({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public routes (uses Header + Footer Layout) ── */}
      <Route element={<Layout><Outlet /></Layout>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        {/* Trang cá nhân (Yêu cầu đăng nhập) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ── Admin routes (uses AdminLayout with sidebar) ── */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<AdminShell><AdminDashboardPage /></AdminShell>} />
        <Route path="users" element={<AdminShell><AdminUsersPage /></AdminShell>} />
        <Route path="products" element={<AdminShell><AdminProductsPage /></AdminShell>} />
        <Route path="categories" element={<AdminShell><AdminCategoriesPage /></AdminShell>} />
        <Route path="tables" element={<AdminShell><AdminTablesPage /></AdminShell>} />
        <Route path="orders" element={<AdminShell><AdminOrdersPage /></AdminShell>} />
      </Route>

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
