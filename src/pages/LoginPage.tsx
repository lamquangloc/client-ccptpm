export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto rounded-lg bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold">Đăng nhập</h1>
      <p className="mt-2 text-slate-600">Đăng nhập để quản lý hoặc đặt bàn.</p>

      <form className="mt-6 space-y-4">
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
          Đăng nhập
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-slate-600">
        <a className="text-indigo-600 hover:underline" href="/forgot-password">
          Quên mật khẩu?
        </a>
        <span className="mx-2">·</span>
        <a className="text-indigo-600 hover:underline" href="/register">
          Đăng ký
        </a>
      </div>
    </div>
  );
}
