import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const userStr = localStorage.getItem('user');
  let isUser = false;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // Kiểm tra có thông tin user không
      if (user && user.email) {
        isUser = true;
      }
    } catch (e) {
      console.error('Lỗi khi đọc thông tin user từ localStorage:', e);
    }
  }

  // Nếu chưa đăng nhập, chuyển về trang /login
  if (!isUser) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, cho phép render các route con (như /profile)
  return <Outlet />;
}
