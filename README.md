# Client CCPTPM

Frontend project cho ứng dụng nhà hàng đặt bàn.

## Phân công công việc & Danh sách Branch
Dưới đây là bảng phân công nhiệm vụ và tên nhánh (branch) dự kiến cho mỗi thành viên. Quy ước đặt tên branch: `feat/<tên-viết-tắt>-<tính-năng>`.

| STT | Thành viên | Vai trò | Phân công công việc | Tên Branch Đề Xuất |
|:---:|:---|:---|:---|:---|
| 1 | **Lâm Quang Lộc** | Nhóm trưởng | Trang menu, Trang chi tiết món | `feat/loc-menu-product, main, develop` |
| 2 | **Nguyễn Hữu Tịnh** | Thành viên | Quản lý người dùng | `feat/tinh-manage-users` |
| 3 | **Đào Nhật Cường** | Thành viên | Đăng nhập, đăng kí, quên mật khẩu, dashboard admin | `feat/cuong-auth-dashboard` |
| 4 | **Hoàng Gia Bảo** | Thành viên | Quản lý bàn | `feat/bao-manage-tables` |
| 5 | **Phạm Tùng Dương** | Thành viên | Trang profile người dùng (trang thông tin và lịch sử đặt bàn) | `feat/duong-user-profile` |
| 6 | **Huỳnh Trung Hậu** | Thành viên | Trang đặt bàn, Quản lý đơn hàng | `feat/hau-booking` |
| 7 | **Phạm Thanh Tuấn** | Thành viên | Trang chủ | `feat/tuan-homepage` |

## Công nghệ
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios (dự phòng)

## Cấu trúc chính
```
client-ccptpm/
├── public/                  # Tài nguyên tĩnh
│   └── index.html
├── src/
│   ├── components/          # Các component tái sử dụng
│   ├── layouts/             # Layout / Header / Footer
│   │   └── Layout.tsx
│   ├── pages/               # Các trang chính
│   │   ├── admin/           # Trang admin
│   │   ├── AboutPage.tsx
│   │   ├── BookingPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MenuPage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── SearchPage.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Chạy dự án
1. Cài đặt dependencies:
   ```bash
   npm install
   ```
2. Chạy dev server:
   ```bash
   npm run dev
   ```
3. Build production:
   ```bash
   npm run build
   ```

## Lưu ý
- Client sẽ chạy ở `http://localhost:3000`.
- API backend mặc định proxy sang `http://localhost:5000/api/*`.
- Khi thêm route mới, cập nhật `src/App.tsx` và tạo file vào `src/pages/`.
