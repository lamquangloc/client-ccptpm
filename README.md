# Client CCPTPM

Frontend project cho ứng dụng nhà hàng đặt bàn.

## Phân công công việc & Danh sách Branch
Dưới đây là bảng phân công nhiệm vụ và tên nhánh (branch) dự kiến cho mỗi thành viên. Quy ước đặt tên branch: `feat/<tên-viết-tắt>-<tính-năng>`.

| STT | Thành viên | Vai trò | Phân công công việc | Tên Branch Đề Xuất |
|:---:|:---|:---|:---|:---|
| 1 | **Lâm Quang Lộc** | Nhóm trưởng | Trang menu, Trang chi tiết món, Quản lý món ăn, Quản lý danh mục | `feat/loc-menu-product, main, develop` |
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
├── .github/
│   └── workflows/
│       └── docker-build-push.yml
├── public/                  # Tài nguyên tĩnh
│   ├── icons/
│   └── UI/
├── src/
│   ├── components/          # Các component tái sử dụng
│   │   ├── AdminRoute.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── layouts/             # Layout / Header / Footer
│   │   ├── AdminLayout.tsx
│   │   └── Layout.tsx
│   ├── pages/               # Các trang chính
│   │   ├── admin/           # Trang admin
│   │   │   ├── AdminCategoriesPage.tsx
│   │   │   ├── AdminCategoryDetailsPage.tsx
│   │   │   ├── AdminCreateCategoryPage.tsx
│   │   │   ├── AdminCreateProductPage.tsx
│   │   │   ├── AdminCreateUserPage.tsx
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminEditCategoryPage.tsx
│   │   │   ├── AdminEditProductPage.tsx
│   │   │   ├── AdminEditUserPage.tsx
│   │   │   ├── AdminOrdersPage.tsx
│   │   │   ├── AdminProductDetailsPage.tsx
│   │   │   ├── AdminProductsPage.tsx
│   │   │   ├── AdminTablesPage.tsx
│   │   │   ├── AdminUserDetailsPage.tsx
│   │   │   └── AdminUsersPage.tsx
│   │   ├── BookingPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MenuPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   └── SearchPage.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   ├── bookingService.ts
│   │   ├── orderService.ts
│   │   ├── productService.ts
│   │   ├── tableService.ts
│   │   └── userService.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
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

## Hướng dẫn Submodule (server-ccptpm)

Repository client đang khai báo backend là Git submodule:
- Path: `server-ccptpm`
- URL: `https://github.com/lamquangloc/server-ccptpm.git`
- Branch theo dõi: `develop`

### Clone đầy đủ cả submodule
```bash
git clone --recurse-submodules https://github.com/lamquangloc/client-ccptpm.git
```

Nếu đã clone trước đó (chưa có submodule):
```bash
git submodule update --init --recursive
```

### Cập nhật submodule lên commit mới nhất của branch develop
```bash
git submodule update --remote --merge
```

Sau khi update, commit ở repository cha để lưu lại con trỏ submodule:
```bash
git add .gitmodules server-ccptpm
git commit -m "chore: update server submodule pointer"
git push
```

### Khi pull code mới từ repository cha
```bash
git pull
git submodule update --init --recursive
```

### Lỗi thường gặp
- Thư mục `server-ccptpm` rỗng hoặc thiếu file: chạy lại `git submodule update --init --recursive`.
- Team pull về nhưng backend không đúng version: vào repo cha và chạy `git submodule status` để kiểm tra commit submodule hiện tại.

## Lưu ý
- Client sẽ chạy ở `http://localhost:3000`.
- API backend mặc định proxy sang `http://localhost:5000/api/*`.
- Khi thêm route mới, cập nhật `src/App.tsx` và tạo file vào `src/pages/`.

## Chạy Client bằng Docker

### File Docker đã thêm
- `Dockerfile`: Build app React/Vite và serve bằng Nginx.
- `.dockerignore`: Loại bỏ file/folder không cần thiết khi build image.
- `nginx.conf`: Cấu hình SPA fallback và proxy API/uploads về backend.
- `docker-compose.yml`: Chạy container client tại cổng 3000.

### Lệnh chạy
1. Build và chạy container:
    ```bash
    docker compose up --build -d
    ```
2. Kiểm tra trạng thái:
    ```bash
    docker compose ps
    ```
3. Truy cập app:
    - `http://localhost:3000`

### Biến môi trường quan trọng cho Docker build
- `VITE_API_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID`

Client Docker lấy các biến này từ file `.env` để build bundle.

### Troubleshooting nhanh
- Lỗi login API trả HTML / `Unexpected token '<'`:
   - Kiểm tra `nginx.conf` có block proxy `/api/` và `/uploads/`.
   - Kiểm tra backend đang chạy ở `http://localhost:5000`.
- Lỗi Google login `invalid_client`:
   - Kiểm tra `VITE_GOOGLE_CLIENT_ID` đúng.
   - Rebuild lại client container sau khi đổi `.env`:
      ```bash
      docker compose up --build -d
      ```
   - Thêm origin `http://localhost:3000` trong Google Cloud OAuth.
