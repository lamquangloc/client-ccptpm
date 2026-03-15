import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error(e);
    }
  }

  // Helper check active router
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Cột trái: Logo */}
      <Link to="/" className="flex flex-col items-center">
        <img 
          src="/logo.png" 
          alt="Ice Restaurant Logo" 
          className="h-14 object-contain"
        />
      </Link>

      {/* Cột giữa: Menu */}
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

      {/* Cột phải: Đăng nhập / User info */}
      <div className="flex items-center gap-4 mt-2">
        {user ? (
          <>
            {user.role === 'admin' ? (
              <Link to="/admin" className="text-[15px] font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                ADMIN
              </Link>
            ) : (
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-[15px] font-semibold text-slate-800">Hi, {user.name}</span>
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-sm border border-slate-300">
                  <img 
                    src={user.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            )}
          </>
        ) : (
          <Link to="/login" className="text-[15px] font-semibold text-slate-800 hover:text-blue-600 transition-colors">
            ĐĂNG NHẬP
          </Link>
        )}
      </div>
    </header>
  );
}
