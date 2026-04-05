import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { bookingService, Booking } from '../services/bookingService';

// ─── Status map ──────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; className: string; dot?: boolean }> = {
  pending:   { label: 'Chờ xác nhận', className: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800', dot: true },
  confirmed: { label: 'Đã xác nhận',  className: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', dot: true },
  completed: { label: 'Hoàn thành',   className: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' },
  canceled:  { label: 'Đã hủy',       className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
};

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  if (dateStr.includes('/')) return dateStr;
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function tableLabel(table: Booking['table']) {
  if (!table) return '—';
  if (typeof table === 'string') return `Bàn #${table.slice(-4)}`;
  return `Bàn số ${table.number}`;
}

// ─── Modal xem chi tiết đặt bàn ──────────────────────────────────────────────
interface DetailModalProps { booking: Booking; onClose: () => void; }
function BookingDetailModal({ booking, onClose }: DetailModalProps) {
  const st = STATUS_MAP[booking.status] || { label: booking.status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a0b0d] rounded-2xl shadow-2xl border border-[#e7cfd3] dark:border-gray-700 w-full max-w-md animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 px-6 py-5 border-b border-[#e7cfd3] dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 dark:bg-primary/20">
              <span className="material-symbols-outlined text-primary text-[22px]">event_note</span>
            </div>
            <div>
              <h3 className="text-[#1b0d10] dark:text-white font-bold text-lg leading-tight">Chi tiết đặt bàn</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">#{booking._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Trạng thái</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${st.className}`}>
              {st.dot && <span className="size-1.5 rounded-full bg-current animate-pulse" />}
              {st.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'person', label: 'Tên khách', value: booking.name },
              { icon: 'phone', label: 'Số điện thoại', value: booking.phone },
              { icon: 'calendar_today', label: 'Ngày đặt', value: formatDate(booking.date) },
              { icon: 'schedule', label: 'Giờ đặt', value: booking.time },
              { icon: 'group', label: 'Số khách', value: `${booking.guests} người` },
              { icon: 'table_restaurant', label: 'Số bàn', value: tableLabel(booking.table) },
            ].map((row) => (
              <div key={row.label} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3.5 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="material-symbols-outlined text-[15px]">{row.icon}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{row.label}</span>
                </div>
                <p className="text-[#1b0d10] dark:text-white font-semibold text-sm">{row.value}</p>
              </div>
            ))}
          </div>

          {booking.createdAt && (
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-1">
              Đặt lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[#1b0d10] dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal xác nhận hủy ──────────────────────────────────────────────────────
interface CancelModalProps { booking: Booking; onConfirm: () => void; onClose: () => void; loading: boolean; }
function CancelModal({ booking, onConfirm, onClose, loading }: CancelModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a0b0d] rounded-2xl shadow-2xl border border-[#e7cfd3] dark:border-gray-700 w-full max-w-sm p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">event_busy</span>
          </div>
          <h3 className="text-[#1b0d10] dark:text-white font-bold text-lg">Hủy đặt bàn?</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
          Hủy đặt bàn vào <span className="font-semibold text-[#1b0d10] dark:text-white">{formatDate(booking.date)}</span> lúc <span className="font-semibold text-[#1b0d10] dark:text-white">{booking.time}</span>?
        </p>
        <p className="text-gray-400 text-xs mt-1 mb-5">Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-[#1b0d10] dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Giữ lại</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[18px]">cancel</span>}
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal đổi mật khẩu ──────────────────────────────────────────────────────
interface ChangePasswordModalProps { token: string; onClose: () => void; }
function ChangePasswordModal({ token, onClose }: ChangePasswordModalProps) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (form.newPassword !== form.confirmPassword) { setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' }); return; }
    if (form.newPassword.length < 6) { setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }); return; }
    setLoading(true);
    try {
      const res = await authService.changePassword(token, form.currentPassword, form.newPassword);
      setMessage({ type: 'success', text: res.message || 'Đổi mật khẩu thành công!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Đổi mật khẩu thất bại.' });
    } finally { setLoading(false); }
  };

  type FK = 'current' | 'new' | 'confirm';
  const fields: { key: FK; label: string; formKey: keyof typeof form }[] = [
    { key: 'current', label: 'Mật khẩu hiện tại', formKey: 'currentPassword' },
    { key: 'new',     label: 'Mật khẩu mới',      formKey: 'newPassword' },
    { key: 'confirm', label: 'Xác nhận mật khẩu mới', formKey: 'confirmPassword' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a0b0d] rounded-2xl shadow-2xl border border-[#e7cfd3] dark:border-gray-700 w-full max-w-md p-6 md:p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[#1b0d10] dark:text-white text-xl font-bold">Đổi mật khẩu</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Nhập mật khẩu hiện tại để xác minh</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg border text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
            <span className="material-symbols-outlined text-[18px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map((field) => (
            <label key={field.key} className="flex flex-col gap-1.5">
              <span className="text-[#1b0d10] dark:text-gray-200 text-sm font-semibold">{field.label}</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
                <input type={show[field.key] ? 'text' : 'password'} value={form[field.formKey]} onChange={(e) => setForm({ ...form, [field.formKey]: e.target.value })} required placeholder="••••••••" className="w-full rounded-lg border border-[#e7cfd3] dark:border-gray-700 bg-[#f9f4f5] dark:bg-gray-900 pl-10 pr-10 py-3 text-[#1b0d10] dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm" />
                <button type="button" onClick={() => setShow((s) => ({ ...s, [field.key]: !s[field.key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{show[field.key] ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </label>
          ))}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-[#1b0d10] dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Hủy</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-[#b00e2a] transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[18px]">lock_reset</span>}
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Trang Profile chính ──────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: authUser, login, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  // Info tab state
  const [profile, setProfile]           = useState({ name: authUser?.name || '', phone: authUser?.phone || '', email: authUser?.email || '' });
  const [saveLoading, setSaveLoading]   = useState(false);
  const [profileMsg, setProfileMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [infoLoading, setInfoLoading]   = useState(false);

  // History tab state
  const [bookings, setBookings]             = useState<Booking[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancelTarget, setCancelTarget]     = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading]   = useState(false);
  const [detailTarget, setDetailTarget]     = useState<Booking | null>(null);

  // Fetch profile
  useEffect(() => {
    if (activeTab !== 'info' || !token) return;
    const doFetch = async () => {
      setInfoLoading(true);
      try {
        const data = await authService.getProfile(token);
        const u = data.user;
        setProfile({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
        login(u, token);
      } catch (err) { console.error('Lỗi load profile:', err); }
      finally { setInfoLoading(false); }
    };
    doFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  // Fetch my bookings
  useEffect(() => {
    if (activeTab !== 'history' || !token) return;
    const doFetch = async () => {
      setBookingLoading(true); setBookingMsg(null);
      try { setBookings(await bookingService.getMyBookings()); }
      catch (err: any) { setBookingMsg({ type: 'error', text: err.message || 'Không thể tải lịch sử đặt bàn.' }); }
      finally { setBookingLoading(false); }
    };
    doFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault(); if (!token) return;
    setSaveLoading(true); setProfileMsg(null);
    try {
      const res = await authService.updateProfile(token, { name: profile.name, phone: profile.phone });
      setProfileMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      if (authUser) login({ ...authUser, name: res.user.name, phone: profile.phone }, token);
    } catch (err: any) { setProfileMsg({ type: 'error', text: err.message || 'Cập nhật thất bại.' }); }
    finally { setSaveLoading(false); }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await bookingService.cancelBooking(cancelTarget._id);
      setBookings((prev) => prev.map((b) => b._id === cancelTarget._id ? { ...b, status: 'canceled' } : b));
      setBookingMsg({ type: 'success', text: 'Hủy đặt bàn thành công.' });
    } catch (err: any) { setBookingMsg({ type: 'error', text: err.message || 'Không thể hủy đặt bàn.' }); }
    finally { setCancelLoading(false); setCancelTarget(null); }
  };

  const handleRebook = (booking: Booking) => {
    window.location.href = `/booking?guests=${booking.guests}`;
  };

  const totalBookings     = bookings.length;
  const upcomingBookings  = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#1b0d10] dark:text-white transition-colors">
      {/* Modals */}
      {showPasswordModal && token && <ChangePasswordModal token={token} onClose={() => setShowPasswordModal(false)} />}
      {cancelTarget && <CancelModal booking={cancelTarget} onConfirm={handleCancelConfirm} onClose={() => setCancelTarget(null)} loading={cancelLoading} />}
      {detailTarget && <BookingDetailModal booking={detailTarget} onClose={() => setDetailTarget(null)} />}

      <div className="flex flex-1 justify-center py-8 px-4 md:px-10 lg:px-20">
        <div className="layout-content-container flex flex-col md:flex-row gap-8 max-w-[1200px] w-full flex-1">

          {/* ── Sidebar ── */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white dark:bg-[#1a0b0d] p-6 rounded-xl shadow-sm border border-[#e7cfd3] dark:border-gray-800 h-fit sticky top-24 transition-colors">

              {/* Avatar + info */}
              <div className="flex gap-3 items-center pb-5 border-b border-[#e7cfd3] dark:border-gray-800 mb-5">
                <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 ring-2 ring-primary/10 shrink-0"
                  style={{ backgroundImage: `url(${authUser?.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'})` }} />
                <div className="flex flex-col min-w-0">
                  <h1 className="text-[#1b0d10] dark:text-white text-sm font-bold truncate">{authUser?.name || 'Thành viên'}</h1>
                  <p className="text-primary text-xs font-medium lowercase first-letter:uppercase">{authUser?.role || 'user'}</p>
                </div>
              </div>

              {/* Title + Dark mode toggle */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#1b0d10] dark:text-white text-base font-bold">Tài khoản của tôi</h2>
                {/* Toggle sáng/tối */}
                <button
                  id="sidebar-theme-toggle"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
                  title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-[#e7cfd3] dark:border-gray-700 bg-background-light dark:bg-gray-900 hover:border-primary dark:hover:border-primary transition-all overflow-hidden group"
                >
                  {/* Sun */}
                  <svg className={`w-4.5 h-4.5 text-amber-400 absolute transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`}
                    fill="currentColor" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.772 19.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591zM5.25 12a.75.75 0 01-.75.75H2.25a.75.75 0 010-1.5H4.5A.75.75 0 015.25 12zM6.166 6.106a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591z" />
                  </svg>
                  {/* Moon */}
                  <svg className={`w-4 h-4 text-slate-500 dark:text-slate-400 absolute transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
                    fill="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Nav */}
              <nav className="flex flex-col gap-2">
                {(['info', 'history'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${activeTab === tab ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:bg-background-light dark:hover:bg-gray-800 text-[#1b0d10] dark:text-gray-300'}`}>
                    <span className={`material-symbols-outlined ${activeTab === tab ? '' : 'text-gray-400 group-hover:text-primary transition-colors'}`}>
                      {tab === 'info' ? 'person' : 'history'}
                    </span>
                    <p className="text-sm font-medium">{tab === 'info' ? 'Thông tin cá nhân' : 'Lịch sử đặt bàn'}</p>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0 flex flex-col gap-6">

            {/* ════ Tab: Thông tin cá nhân ════ */}
            {activeTab === 'info' && (
              <div className="bg-white dark:bg-[#1a0b0d] rounded-xl shadow-md border border-[#e7cfd3] dark:border-gray-800 overflow-hidden transition-colors animate-fade-in">
                <div className="p-6 md:p-8 border-b border-[#e7cfd3] dark:border-gray-800">
                  <h2 className="text-[#1b0d10] dark:text-white text-2xl md:text-3xl font-bold mb-1">Thông tin cá nhân</h2>
                  <p className="text-[#9a4c59] dark:text-gray-400 text-sm">Quản lý chi tiết cá nhân được sử dụng cho việc đặt bàn.</p>
                </div>
                {infoLoading ? (
                  <div className="flex items-center justify-center p-16">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="p-6 md:p-8 flex flex-col gap-8">
                    {profileMsg && (
                      <div className={`px-4 py-3 rounded-lg border flex items-center gap-2 text-sm ${profileMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
                        <span className="material-symbols-outlined text-[18px]">{profileMsg.type === 'success' ? 'check_circle' : 'error'}</span>
                        {profileMsg.text}
                      </div>
                    )}
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="bg-center bg-no-repeat bg-cover rounded-full h-24 w-24 md:h-28 md:w-28 shadow-inner border-4 border-background-light dark:border-gray-700 relative"
                        style={{ backgroundImage: `url(${authUser?.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'})` }}>
                        <button aria-label="Sửa ảnh" className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-600 hover:text-primary text-gray-600 dark:text-gray-300 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-[#1b0d10] dark:text-white text-xl font-bold">{profile.name || 'Thành viên'}</h3>
                        <button className="text-primary text-sm font-medium hover:underline text-left">Tải ảnh mới lên</button>
                        <p className="text-xs text-gray-400 mt-1">Kích thước khuyên dùng: 400x400px</p>
                      </div>
                    </div>
                    {/* Form */}
                    <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6 max-w-3xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2">
                          <span className="text-[#1b0d10] dark:text-gray-200 text-sm font-semibold">Tên hiển thị</span>
                          <input className="form-input w-full rounded-lg border border-[#e7cfd3] dark:border-gray-700 bg-background-light dark:bg-gray-900 px-4 py-3 text-[#1b0d10] dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" placeholder="Nhập tên của bạn" type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-[#1b0d10] dark:text-gray-200 text-sm font-semibold">Số điện thoại</span>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">phone</span>
                            <input className="form-input w-full rounded-lg border border-[#e7cfd3] dark:border-gray-700 bg-background-light dark:bg-gray-900 pl-10 pr-4 py-3 text-[#1b0d10] dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" placeholder="0123 456 789" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                          </div>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2">
                          <span className="text-[#1b0d10] dark:text-gray-200 text-sm font-semibold">Địa chỉ Email</span>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                            <input className="form-input w-full rounded-lg border border-[#e7cfd3] dark:border-gray-700 bg-background-light dark:bg-gray-900 pl-10 pr-4 py-3 text-[#1b0d10] dark:text-white opacity-70 cursor-not-allowed outline-none" type="email" value={profile.email} readOnly />
                          </div>
                          <p className="text-xs text-[#9a4c59] dark:text-gray-500">Chúng tôi sẽ gửi xác nhận tại đây.</p>
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-[#1b0d10] dark:text-gray-200 text-sm font-semibold">Mật khẩu</span>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3 text-gray-400 text-[20px]">lock</span>
                            <input className="form-input w-full rounded-lg border border-[#e7cfd3] dark:border-gray-700 bg-background-light dark:bg-gray-900 pl-10 pr-10 py-3 text-[#1b0d10] dark:text-white opacity-60 cursor-not-allowed outline-none" type="password" value="••••••••" readOnly />
                            <span className="absolute right-3 text-gray-300 dark:text-gray-600"><span className="material-symbols-outlined text-[20px]">visibility_off</span></span>
                          </div>
                          <button className="text-xs text-primary font-semibold text-left hover:underline w-fit flex items-center gap-1" type="button" onClick={() => setShowPasswordModal(true)}>
                            <span className="material-symbols-outlined text-[14px]">lock_reset</span>Đổi mật khẩu
                          </button>
                        </label>
                      </div>
                      <div className="bg-background-light/50 dark:bg-black/20 mt-4 -mx-8 -mb-8 p-6 md:p-8 border-t border-[#e7cfd3] dark:border-gray-800 flex justify-end gap-4">
                        <button type="button" onClick={() => setProfileMsg(null)} className="px-6 py-2.5 rounded-lg border border-transparent text-[#1b0d10] dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Hủy</button>
                        <button type="submit" disabled={saveLoading} className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-md hover:bg-[#b00e2a] focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex items-center gap-2 disabled:opacity-70">
                          {saveLoading ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[18px]">save</span>}
                          Lưu thay đổi
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ════ Tab: Lịch sử đặt bàn ════ */}
            {activeTab === 'history' && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div>
                  <h2 className="text-3xl font-black text-[#1b0d10] dark:text-white tracking-tight">Lịch sử đặt bàn</h2>
                  <p className="text-[#9a4c59] dark:text-gray-400 text-base mt-1">Xem và quản lý toàn bộ lịch sử đặt bàn của bạn.</p>
                </div>

                {bookingMsg && (
                  <div className={`px-4 py-3 rounded-lg border flex items-center gap-2 text-sm ${bookingMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
                    <span className="material-symbols-outlined text-[18px]">{bookingMsg.type === 'success' ? 'check_circle' : 'error'}</span>
                    {bookingMsg.text}
                    <button onClick={() => setBookingMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-[16px]">close</span></button>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: 'restaurant',    label: 'Tổng lượt đặt', value: totalBookings },
                    { icon: 'calendar_month', label: 'Sắp tới',       value: upcomingBookings },
                    { icon: 'task_alt',       label: 'Hoàn thành',    value: completedBookings },
                  ].map((stat) => (
                    <div key={stat.icon} className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-[#1a0b0d] border border-[#e7cfd3] dark:border-gray-800 shadow-sm transition-colors">
                      <div className="flex items-center gap-2 text-primary mb-1">
                        <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">{stat.label}</p>
                      </div>
                      <p className="text-[#1b0d10] dark:text-white text-3xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-[#1a0b0d] rounded-xl border border-[#e7cfd3] dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
                  <div className="overflow-x-auto min-h-[300px]">
                    {bookingLoading ? (
                      <div className="flex items-center justify-center p-20">
                        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <span className="material-symbols-outlined text-[64px] text-gray-300 dark:text-gray-700 mb-4">event_note</span>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Bạn chưa có lịch sử đặt bàn nào.</p>
                        <a href="/booking" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-[#b00e2a] transition-colors shadow-md">
                          <span className="material-symbols-outlined text-[18px]">add_circle</span>Đặt bàn ngay
                        </a>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-background-light dark:bg-gray-900/50 border-b border-[#e7cfd3] dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-6 py-4">Ngày &amp; Giờ</th>
                            <th className="px-6 py-4">Số khách</th>
                            <th className="px-6 py-4">Bàn</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {bookings.map((b) => {
                            const st = STATUS_MAP[b.status] || { label: b.status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
                            const canCancel = b.status === 'pending' || b.status === 'confirmed';
                            const canRebook = b.status === 'completed' || b.status === 'canceled';
                            return (
                              <tr key={b._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                                      <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[#1b0d10] dark:text-white text-sm">{formatDate(b.date)}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{b.time}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-sm">
                                    <span className="material-symbols-outlined text-[16px]">group</span>
                                    <span className="font-medium">{b.guests} người</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{tableLabel(b.table)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${st.className}`}>
                                    {st.dot && <span className="size-1.5 rounded-full bg-current animate-pulse" />}
                                    {st.label}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {/* Xem chi tiết */}
                                    <button
                                      onClick={() => setDetailTarget(b)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                                      title="Xem chi tiết"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                                      Chi tiết
                                    </button>
                                    {canCancel && (
                                      <button
                                        onClick={() => { setBookingMsg(null); setCancelTarget(b); }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                                        Hủy
                                      </button>
                                    )}
                                    {canRebook && (
                                      <button
                                        onClick={() => handleRebook(b)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-transparent transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">replay</span>
                                        Đặt lại
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {bookings.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tổng cộng <span className="font-semibold text-[#1b0d10] dark:text-white">{bookings.length}</span> lượt đặt bàn
                      </p>
                      <a href="/booking" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>Đặt thêm bàn mới
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
