export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto rounded-lg bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold">Đăng ký</h1>
      <p className="mt-2 text-slate-600">Tạo tài khoản mới để đặt bàn nhanh chóng.</p>

      <form className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Họ tên</label>
          <input
            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            type="text"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            type="email"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
          <input
            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            type="password"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Đăng ký
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-slate-600">
        <span>Đã có tài khoản? </span>
        <a className="text-indigo-600 hover:underline" href="/login">
          Đăng nhập
        </a>
      </div>
    </div>
  );
}
