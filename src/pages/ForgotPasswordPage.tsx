export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto rounded-lg bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold">Quên mật khẩu</h1>
      <p className="mt-2 text-slate-600">Nhập email để nhận đường dẫn đặt lại mật khẩu.</p>

      <form className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            type="email"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Gửi liên kết
        </button>
      </form>
    </div>
  );
}
