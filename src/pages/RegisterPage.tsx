import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!name.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }
    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      };
      const data = await authService.register(payload);
      login(data.user, data.token);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Tính strength mật khẩu
  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Quá ngắn', color: 'bg-red-400', width: '25%' };
    if (password.length < 8) return { label: 'Yếu', color: 'bg-orange-400', width: '50%' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: 'Mạnh', color: 'bg-green-500', width: '100%' };
    return { label: 'Trung bình', color: 'bg-yellow-400', width: '75%' };
  };
  const strength = getPasswordStrength();

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-50 rounded-full mb-4">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Tạo tài khoản mới</h1>
              <p className="mt-1 text-sm text-slate-500">Đăng ký để đặt bàn nhanh chóng</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Họ tên */}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400
                               focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400
                               focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Số điện thoại */}
              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Số điện thoại <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    id="reg-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400
                               focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400
                               focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Password strength bar */}
                {strength && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Độ mạnh: <span className="font-medium">{strength.label}</span></p>
                  </div>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className={`w-full rounded-lg border bg-slate-50 pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400
                               focus:bg-white focus:outline-none focus:ring-2 transition
                               ${confirmPassword && password !== confirmPassword
                                 ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                 : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100'}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Mật khẩu không khớp</p>
                )}
                {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mật khẩu khớp
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button
                  id="btn-register-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white 
                             shadow-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
                             active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang đăng ký...
                    </span>
                  ) : (
                    'Tạo tài khoản'
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-medium text-purple-600 hover:text-purple-700 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
