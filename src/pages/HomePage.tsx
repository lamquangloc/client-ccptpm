export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trang chủ</h1>
      <p>Chào mừng đến với hệ thống đặt bàn nhà hàng.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Xem Menu</h2>
          <p className="mt-2 text-sm text-slate-600">Khám phá món ăn của chúng tôi.</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Đặt bàn</h2>
          <p className="mt-2 text-sm text-slate-600">Chọn bàn và thời gian phù hợp cho bạn.</p>
        </div>
      </div>
    </div>
  );
}
