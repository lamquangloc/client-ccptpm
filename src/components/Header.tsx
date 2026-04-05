import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex flex-col items-center">
        <img
          src="/icons/logo_restaurant.png"
          alt="Ice Restaurant Logo"
          className="h-14 object-contain"
        />
      </Link>

      {/* Nav trung tâm */}
      <nav className="hidden md:flex items-center gap-12 mt-2">
        <Link
          to="/"
          className={`text-[15px] font-semibold tracking-wide ${isActive('/') ? 'text-blue-600' : 'text-slate-800 hover:text-blue-600'}`}
        >
          TRANG CHỦ
        </Link>
        <Link
          to="/menu"
          className={`text-[15px] font-semibold tracking-wide ${isActive('/menu') ? 'text-blue-600' : 'text-slate-800 hover:text-blue-600'}`}
        >
          MENU
        </Link>
        <Link
          to="/booking"
          className={`text-[15px] font-semibold tracking-wide ${isActive('/booking') ? 'text-blue-600' : 'text-slate-800 hover:text-blue-600'}`}
        >
          ĐẶT BÀN
        </Link>
      </nav>

      {/* Phần phải: Auth */}
      <div className="flex items-center gap-4 mt-2" id="header-auth-section">
        {user ? (
          <div className="relative">
            {/* Avatar + tên (click mở dropdown) */}
            <button
              id="header-user-menu-btn"
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity focus:outline-none"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-semibold text-slate-800 leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-400 capitalize leading-tight">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-sm border border-slate-300">
                <img
                  src={user.avatar && !user.avatar.includes('default') ? `${API_BASE}${user.avatar}` : `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <svg
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                {/* Overlay trong suốt để đóng menu */}
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-fade-in">
                  {user.role === 'admin' ? (
                    <Link
                      to="/admin"
                      id="header-admin-link"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                      Dashboard Admin
                    </Link>
                  ) : (
                    <Link
                      to="/profile"
                      id="header-profile-link"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Tài khoản của tôi
                    </Link>
                  )}
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    id="header-logout-btn"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              id="header-login-link"
              className="text-[14px] font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              id="header-register-link"
              className="text-[14px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
