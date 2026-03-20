import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { bookingService, Booking } from '../services/bookingService';
import { authService } from '../services/authService';

export default function ProfilePage() {
  const { user: authUser, login, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [profile, setProfile] = useState({
    name: authUser?.name || '',
    phone: '0987654321', // Giả định hoặc lấy từ user payload nếu có
    email: authUser?.email || '',
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch dữ liệu khi mount hoặc đổi tab
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        if (activeTab === 'info') {
          const data = await authService.getProfile(token);
          setProfile({
            name: data.user.name,
            email: data.user.email,
            phone: '0987654321', // API BE có thể cần trả thêm phone
          });
          // Update context/localStorage if needed
          login(data.user, token);
        } else {
          const data = await bookingService.getMyBookings();
          setBookings(data);
        }
      } catch (err: any) {
        console.error('Lỗi fetch data:', err);
        // Nếu lỗi 404 hoặc chưa có API thật, ta giữ mock data để test UI
        if (activeTab === 'history' && bookings.length === 0) {
           setBookings([
            { _id: 'OD-1982', restaurant: "Luigi's Trattoria", type: "Italian • Downtown", date: '24/10/2023', time: '19:00', status: 'Sắp tới', guests: 2, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJeO53NqALa-UxHPb4kI1laDDWFap54TbntNOGqnVEiaJXlxFyIsKYb9__PEtn1E2mxx5TuRl3p5O93FxgtmgXzc-_ZTAsb6SRkeFSt7FNQBpu9sgznfHy0ct26OmOwSbcjRXDvi7vr38w4GQJBDoSylESyIrgMVReUrXd3FeqJs9TyrQgNtc2LCXVQMkKJ-A6JXZnasGUADLOk6JRT4lSZdrUb6NuKWjLqrW_yw6yjvg0GVfyhdraCPmdyull4fnsxkulDj8Hiv3O" },
            { _id: 'OD-3342', restaurant: "The Burger Joint", type: "American • Westside", date: '10/09/2023', time: '13:00', status: 'Hoàn thành', guests: 4, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDF4lZ6baLL-4RWBByXyj7d0XoVNz9Vcy8rgd3RU70GuJVMg9UaKYe3eGYNSsyAuEwX64qfCV_4akAwvDvYNSgmb1NCPN6naKkwEEiuRkLBAQ8V0RRmSyEEQd4ZH9jVhQglCllYKrNptOkgeR5UyEEIIEHunBnxMNcouZXGV1pbVfaF984BMyuIhNIgmVcAjuEA_GKJXxVV5ToOBzM-pQji-ySmP6UBu-mNQK1ta1Zpu7zobHR1cOw9qINfsFAkCJnrXRKOC0CuiJS8" },
            { _id: 'OD-8811', restaurant: "Sushi Zen", type: "Japanese • Uptown", date: '05/08/2023', time: '20:00', status: 'Đã hủy', guests: 2, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUtIJa6FwGLpPFN0qBvYaXRHFydvOYB1GCCdZ_pYvSAvZlGFrX6-xhi2gV2IxMg9ZG53fZ6FyXLuOrdtsYYRoTg-b68uXNlql7bm7dlJ1h7ZKgzwAWpMPrvBm6CvyQ-XwSbe9VFTvHHPNc2O_eZd_T2XqZ471yAiOVnY56msF0Tx4h68OK4IlB3g11GvvlTZVGDwPmEnIE3xrdM45jYtYPXOFTUJDJ7RFTUhWTlG72xtzdVfdrqARU6U8gB-uzjD6XbBZvZKdeJVJY" },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, token, login]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!authUser?.id) return;
    
    setSaveLoading(true);
    setMessage(null);
    try {
      await userService.updateUser(authUser.id, {
        name: profile.name,
        // Các trường khác như phone nếu BE hỗ trợ
      });
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      // Cập nhật lại context
      login({ ...authUser, name: profile.name }, token || '');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Cập nhật thất bại.' });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#1b0d10] dark:text-white transition-colors">
      <div className="flex flex-1 justify-center py-8 px-4 md:px-10 lg:px-20">
        <div className="layout-content-container flex flex-col md:flex-row gap-8 max-w-[1200px] w-full flex-1">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white dark:bg-[#1a0b0d] p-6 rounded-xl shadow-sm border border-[#e7cfd3] dark:border-gray-800 h-fit sticky top-24 transition-colors">
              <div className="flex flex-col mb-6">
                <div className="flex gap-4 items-center pb-6 border-b border-[#e7cfd3] dark:border-gray-800 mb-6 font-display">
                  <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full size-12 ring-2 ring-primary/10"
                    style={{ backgroundImage: `url(${authUser?.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'})` }}
                  ></div>
                  <div className="flex flex-col">
                    <h1 className="text-[#1b0d10] dark:text-white text-base font-bold leading-normal truncate w-32">{authUser?.name || 'Thành viên'}</h1>
                    <p className="text-primary text-xs font-medium leading-normal lowercase first-letter:uppercase">{authUser?.role || 'user'}</p>
                  </div>
                </div>
                <h2 className="text-[#1b0d10] dark:text-white text-lg font-bold leading-normal">Tài khoản của tôi</h2>
                <p className="text-[#9a4c59] dark:text-gray-400 text-sm font-normal leading-normal">Quản lý cài đặt</p>
              </div>
              <nav className="flex flex-col gap-2">
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${activeTab === 'info' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:bg-background-light dark:hover:bg-gray-800 text-[#1b0d10] dark:text-gray-300'}`}
                >
                  <span className={`material-symbols-outlined ${activeTab === 'info' ? 'fill-current' : 'text-gray-500 group-hover:text-primary transition-colors'}`}>person</span>
                  <p className="text-sm font-medium leading-normal">Thông tin cá nhân</p>
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${activeTab === 'history' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:bg-background-light dark:hover:bg-gray-800 text-[#1b0d10] dark:text-gray-300'}`}
                >
                  <span className={`material-symbols-outlined ${activeTab === 'history' ? 'fill-current' : 'text-gray-500 group-hover:text-primary transition-colors'}`}>history</span>
                  <p className="text-sm font-medium leading-normal">Lịch sử đặt bàn</p>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 flex flex-col gap-6">
            
            {activeTab === 'info' && (
              <div className="bg-white dark:bg-[#1a0b0d] rounded-xl shadow-md border border-[#e7cfd3] dark:border-gray-800 overflow-hidden transition-colors animate-fade-in">
                <div className="p-6 md:p-8 border-b border-[#e7cfd3] dark:border-gray-800">
                  <h2 className="text-[#1b0d10] dark:text-white text-2xl md:text-3xl font-bold leading-tight mb-2">Thông tin cá nhân</h2>
                  <p className="text-[#9a4c59] dark:text-gray-400 text-sm md:text-base font-normal">Quản lý chi tiết cá nhân và sở thích liên lạc của bạn được sử dụng cho việc đặt bàn.</p>
                </div>
                <div className="p-6 md:p-8 flex flex-col gap-8">
                  {message && (
                    <div className={`px-4 py-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      {message.text}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6">
                    <div 
                      className="bg-center bg-no-repeat bg-cover rounded-full h-24 w-24 md:h-28 md:w-28 shadow-inner border-4 border-background-light dark:border-gray-700 relative"
                      style={{ backgroundImage: `url(${authUser?.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'})` }}
                    >
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
                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6 max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <label className="flex flex-col gap-2">
                        <span className="text-[#1b0d10] dark:text-gray-200 text-sm font-semibold">Tên hiển thị</span>
                        <input 
                          className="form-input w-full rounded-lg border border-[#e7cfd3] dark:border-gray-700 bg-background-light dark:bg-gray-900 px-4 py-3 text-[#1b0d10] dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                          placeholder="Nhập tên của bạn" 
                          type="text" 
                          value={profile.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({...profile, name: e.target.value})}
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[#1b0d10] dark:text-gray-200 text-sm font-semibold">Số điện thoại</span>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">phone</span>
                          <input 
                            className="form-input w-full rounded-lg border border-[#e7cfd3] dark:border-gray-700 bg-background-light dark:bg-gray-900 pl-10 pr-4 py-3 text-[#1b0d10] dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                            placeholder="0123 456 789" 
                            type="tel" 
                            value={profile.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({...profile, phone: e.target.value})}
                          />
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
                        <p className="text-xs text-[#9a4c59] dark:text-gray-500">Chúng tôi sẽ gửi xác nhận đặt bàn tại đây.</p>
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[#1b0d10] dark:text-gray-200 text-sm font-semibold">Mật khẩu</span>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-gray-400 text-[20px]">lock</span>
                          <input className="form-input w-full rounded-lg border border-[#e7cfd3] dark:border-gray-700 bg-background-light dark:bg-gray-900 pl-10 pr-10 py-3 text-[#1b0d10] dark:text-white outline-none" type="password" value="********" readOnly />
                          <button className="absolute right-3 text-gray-400 hover:text-primary transition-colors" type="button">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </div>
                        <button className="text-xs text-primary font-medium text-left hover:underline w-fit" type="button">Đổi mật khẩu</button>
                      </label>
                    </div>

                    <div className="bg-background-light/50 dark:bg-black/20 mt-4 -mx-8 -mb-8 p-6 md:p-8 border-t border-[#e7cfd3] dark:border-gray-800 flex justify-end gap-4 transition-colors">
                      <button type="button" className="px-6 py-2.5 rounded-lg border border-transparent text-[#1b0d10] dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Hủy</button>
                      <button 
                        type="submit"
                        disabled={saveLoading}
                        className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-md hover:bg-[#b00e2a] focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex items-center gap-2 disabled:opacity-70"
                      >
                        {saveLoading ? (
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">save</span>
                        )}
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-black text-[#1b0d10] dark:text-white tracking-tight">Lịch sử đặt bàn</h2>
                  <p className="text-[#9a4c59] dark:text-gray-400 text-base">Quản lý các lượt đặt chỗ sắp tới và xem toàn bộ lịch sử ăn uống của bạn.</p>
                </div>

                {/* Thống kê */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-[#1a0b0d] border border-[#e7cfd3] dark:border-gray-800 shadow-sm transition-colors">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <span className="material-symbols-outlined text-[24px]">restaurant</span>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Tổng lượt đặt</p>
                    </div>
                    <p className="text-[#1b0d10] dark:text-white text-3xl font-bold leading-tight">{bookings.length}</p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-[#1a0b0d] border border-[#e7cfd3] dark:border-gray-800 shadow-sm transition-colors">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Sắp tới</p>
                    </div>
                    <p className="text-[#1b0d10] dark:text-white text-3xl font-bold leading-tight">
                      {bookings.filter(b => b.status === 'Sắp tới').length}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-[#1a0b0d] border border-[#e7cfd3] dark:border-gray-800 shadow-sm transition-colors">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <span className="material-symbols-outlined text-[24px]">favorite</span>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Yêu thích nhất</p>
                    </div>
                    <p className="text-[#1b0d10] dark:text-white text-xl font-bold leading-tight truncate">
                      {bookings.length > 0 ? bookings[0].restaurant : 'Chưa có'}
                    </p>
                  </div>
                </div>

                {/* Bảng dữ liệu */}
                <div className="bg-white dark:bg-[#1a0b0d] rounded-xl border border-[#e7cfd3] dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
                  <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                      <div className="flex items-center justify-center p-20">
                        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-background-light dark:bg-gray-900/50 border-b border-[#e7cfd3] dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-6 py-4">Nhà hàng</th>
                            <th className="px-6 py-4">Ngày & Giờ</th>
                            <th className="px-6 py-4">Số khách</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {bookings.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div 
                                    className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700 bg-cover bg-center shrink-0"
                                    style={{ backgroundImage: `url(${order.image})` }}
                                  ></div>
                                  <div>
                                    <p className="font-semibold text-[#1b0d10] dark:text-white">{order.restaurant}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.type}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-[#1b0d10] dark:text-white">{order.date}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{order.time}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 text-sm">
                                  <span className="material-symbols-outlined text-[16px]">group</span>
                                  <span>{order.guests}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                  order.status === 'Sắp tới' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800' :
                                  order.status === 'Hoàn thành' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-100 dark:border-green-800' :
                                  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                }`}>
                                  {order.status === 'Sắp tới' && <span className="size-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {order.status === 'Sắp tới' ? (
                                  <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-red-700 rounded-lg transition-colors shadow-sm shadow-primary/30">Chỉnh sửa</button>
                                ) : (
                                  <div className="flex items-center justify-end gap-3">
                                    <button className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-colors underline-offset-4 hover:underline">Hóa đơn</button>
                                    <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-transparent">Đặt lại</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                          {bookings.length === 0 && !loading && (
                            <tr>
                              <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                Bạn chưa có lịch sử đặt bàn nào.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hiển thị <span className="font-medium text-[#1b0d10] dark:text-white">1</span> đến <span className="font-medium text-[#1b0d10] dark:text-white">{bookings.length}</span> trong số <span className="font-medium text-[#1b0d10] dark:text-white">{bookings.length}</span> kết quả</p>
                    <div className="flex gap-2">
                       <button className="px-3 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50">Trước</button>
                       <button className="px-3 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-[#1b0d10] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Tiếp</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
