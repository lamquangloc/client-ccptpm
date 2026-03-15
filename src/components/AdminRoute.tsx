import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const userStr = localStorage.getItem('user');
  let isAdmin = false;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // Giả sử user có thuộc tính role như trong file User models
      if (user && user.role === 'admin') {
        isAdmin = true;
      }
    } catch (e) {
      console.error('Lỗi khi đọc thông tin user từ localStorage:', e);
    }
  }

  // Nếu không phải admin, chuyển hướng trang lỗi 404 (Không tìm thấy trang)
  if (!isAdmin) {
    return <Navigate to="/404" replace />;
  }

  // Nếu là admin, cho phép render các route con
  return <Outlet />;
}
